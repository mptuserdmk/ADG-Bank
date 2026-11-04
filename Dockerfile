# Multi-stage Dockerfile for ADG-Bank Microservices
# Syntax: docker build --build-arg SERVICE_NAME=account-service -t adg-bank/account-service:latest .

FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /workspace

# Copy root pom, maven wrapper and all modules poms for layer caching
COPY pom.xml mvnw ./
COPY .mvn .mvn
COPY common-dto/pom.xml common-dto/
COPY config-server/pom.xml config-server/
COPY eureka-server/pom.xml eureka-server/
COPY api-gateway/pom.xml api-gateway/
COPY user-service/pom.xml user-service/
COPY account-service/pom.xml account-service/
COPY transaction-service/pom.xml transaction-service/
COPY pqc-vault-service/pom.xml pqc-vault-service/
COPY market-rate-service/pom.xml market-rate-service/

# Cache dependency downloads
RUN ./mvnw dependency:go-offline -B || true

# Copy all source files
COPY common-dto common-dto
COPY config-server config-server
COPY eureka-server eureka-server
COPY api-gateway api-gateway
COPY user-service user-service
COPY account-service account-service
COPY transaction-service transaction-service
COPY pqc-vault-service pqc-vault-service
COPY market-rate-service market-rate-service

# Build the requested service
ARG SERVICE_NAME
RUN ./mvnw clean package -pl ${SERVICE_NAME} -am -DskipTests

# Runtime stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN apk add --no-cache curl wget bash && \
    addgroup -S adgbank && adduser -S adgbank -G adgbank

ARG SERVICE_NAME
ENV SERVICE_NAME=${SERVICE_NAME}

COPY --from=builder /workspace/${SERVICE_NAME}/target/*.jar app.jar
RUN chown -R adgbank:adgbank /app

USER adgbank

EXPOSE 8080 8081 8082 8083 8084 8085 8761 8888

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -XX:+UseG1GC -jar app.jar"]

