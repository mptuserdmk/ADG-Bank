# Пошаговый план реализации: Микросервисная система ADG-Bank на Spring Cloud

> Документ сформирован с использованием методологий **gstack** (`autoplan`, `plan-ceo-review`, `plan-eng-review`, `plan-design-review`) и **ECC** (`springboot-patterns`, `api-design`, `tdd-workflow`, `agent-security-hardening`).

---

## 1. Концепция и продуктовый обзор (CEO & Product Review / gstack)

- **Название проекта**: ADG-Bank Microservices
- **Бизнес-контекст**: Учебный финтех-проект, моделирующий базовые банковские операции с разделением ответственности между независимыми сервисами.
- **Минимально жизнеспособный продукт (MVP)**:
  Вместо абстрактных заглушек («сервис 1, 2, 3») проект реализует цельную и понятную предметную область **банка**:
  1. **`user-service`** (Клиенты): Регистрация и получение профиля клиента.
  2. **`account-service`** (Счета): Открытие банковских счетов, хранение баланса, пополнение/списание.
  3. **`transaction-service`** (Переводы): Проведение денежных переводов между счетами клиентов с межсервисным вызовом `account-service` под защитой **Circuit Breaker**.
- **Критерий успеха (Demoable Value)**:
  - Преподаватель или проверяющий запускает систему и видит все сервисы на дашборде **Eureka** (`http://localhost:8761`).
  - Все внешние запросы идут через **API Gateway** (`http://localhost:8080`).
  - При отключении `account-service` перевод не падает с 500 ошибкой, а корректно обрабатывается **Circuit Breaker Fallback** (понятное сообщение: «Сервис счетов временно недоступен, перевод отложен»).
  - Документация **Swagger UI** доступна централизованно через Gateway.

---

## 2. Архитектурный обзор (Engineering Review / gstack & ECC)

### 2.1. Топология и карта портов

| Сервис | Тип | Порт | Технологии | Роль в системе |
| :--- | :--- | :--- | :--- | :--- |
| **`config-server`** | Инфраструктура | `8888` | Spring Cloud Config Server | Централизованное хранилище `.yml`/`.properties` для всех микросервисов |
| **`eureka-server`** | Инфраструктура | `8761` | Spring Cloud Netflix Eureka | Service Registry / Discovery (обнаружение сервисов) |
| **`api-gateway`** | Шлюз | `8080` | Spring Cloud Gateway, Reactive WebFlux | Единая точка входа, маршрутизация (`lb://...`), Gateway Circuit Breaker |
| **`user-service`** | Бизнес-сервис | `8081` | Spring MVC, Spring Data JPA, H2/PostgreSQL | Управление профилями клиентов |
| **`account-service`** | Бизнес-сервис | `8082` | Spring MVC, Spring Data JPA, H2/PostgreSQL | Управление счетами и балансами |
| **`transaction-service`** | Бизнес-сервис | `8083` | Spring MVC, OpenFeign, Resilience4j | Обработка транзакций, вызов `account-service` через Feign + Circuit Breaker |
| **`frontend`** | Веб-интерфейс | `5173` | React, TypeScript, Vite, Tailwind | Веб-кабинет банка (см. [FRONTEND_PLAN.md](./FRONTEND_PLAN.md)) |

```
                       [ Клиент / Браузер / Swagger UI ]
                                       │
                                       ▼ (HTTP :8080)
                             ┌───────────────────┐
                             │    API GATEWAY    │ ◄─── (Регистрируется в Eureka)
                             │   (Spring Cloud)  │ ◄─── (Берет конфиг из Config)
                             └─────────┬─────────┘
                                       │ маршрутизация (lb://...)
             ┌─────────────────────────┼─────────────────────────┐
             ▼                         ▼                         ▼
    ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
    │  user-service   │       │ account-service │       │transaction-serv │
    │     (:8081)     │       │     (:8082)     │       │     (:8083)     │
    └────────┬────────┘       └────────┬────────┘       └────────┬────────┘
             │                         ▲                         │
             │                         │   OpenFeign + Circuit   │
             │                         └─────── Breaker ─────────┘
             │                                 (Resilience4j)
             │
             ▼
    ┌─────────────────┐                 ┌─────────────────┐
    │  EUREKA SERVER  │ ◄─ Heartbeats ──┤  CONFIG SERVER  │ (Хранит конфиги:
    │     (:8761)     │   и discovery   │     (:8888)     │  application.yml,
    └─────────────────┘                 └─────────────────┘  gateway.yml...)
```

### 2.2. Стек и версии компонентов
- **Java**: 17 или 21 (LTS)
- **Spring Boot**: 3.3.x (или 3.4.x)
- **Spring Cloud**: 2023.0.x (Leyton) / 2024.0.x
- **Spring Cloud Config Server**: native-профиль (локальная папка с конфигами внутри проекта) для простоты запуска без внешнего git-репозитория.
- **Service Discovery**: Spring Cloud Netflix Eureka Server / Client.
- **API Gateway**: Spring Cloud Gateway (маршруты на основе `DiscoveryClientRouteDefinitionLocator` или явных предикатов).
- **Circuit Breaker**: Spring Cloud CircuitBreaker + **Resilience4j**.
- **Observability**: Spring Boot Actuator (`/actuator/health`, `/actuator/info`, `/actuator/circuitbreakers`) + SLF4J/MDC.
- **Документация**: SpringDoc OpenAPI 2.x (Swagger UI) с агрегацией на API Gateway.

---

## 3. Требования финансовой надежности и безопасности (ECC Hardening)

1. **Денежные типы данных**:
   Никаких `float` и `double`. Балансы счетов и суммы транзакций хранятся в `BigDecimal` с округлением `RoundingMode.HALF_EVEN` (банковское округление) и масштабом 2, либо в копейках/центах (`Long`).
2. **Идемпотентность**:
   POST-запросы на создание транзакции принимают заголовок `X-Idempotency-Key` (UUID) во избежание дублирования списаний при сетевых сбоях и повторных кликах.
3. **Безопасность Actuator**:
   Эндпоинты `/actuator/health` и `/actuator/info` открыты для мониторинга, а чувствительные эндпоинты (env, heapdump) закрыты или отключены.

---

## 4. Пошаговый план реализации

### Этап 1: Создание структуры Maven Multi-Module проекта
- [x] Создать корневой `pom.xml` с `<packaging>pom</packaging>`.
- [x] Задать родительский `spring-boot-starter-parent` (версия 3.3.x).
- [x] Подключить `spring-cloud-dependencies` (BOM 2023.0.x) в секцию `<dependencyManagement>`.
- [x] Объявить модули:
  - `config-server`
  - `eureka-server`
  - `api-gateway`
  - `user-service`
  - `account-service`
  - `transaction-service`
  - `common-dto` (общие DTO, если потребуется для межсервисного обмена).

### Этап 2: Настройка Spring Cloud Config Server (`config-server`)
- [x] Создать модуль `config-server` с зависимостью `spring-cloud-config-server`.
- [x] Добавить аннотацию `@EnableConfigServer` в главный класс.
- [x] Настроить `application.yml`:
  - Порт: `8888`
  - Профиль `native` со ссылкой на локальный каталог конфигов (например, `classpath:/config` или `file:./config-repo`).
- [x] Подготовить файлы конфигурации для каждого сервиса:
  - `application.yml` (общие настройки Actuator и Eureka client)
  - `api-gateway.yml`
  - `user-service.yml`
  - `account-service.yml`
  - `transaction-service.yml`
- [x] Проверить: запуск и доступность конфигов по HTTP (`http://localhost:8888/user-service/default`).

### Этап 3: Настройка Service Discovery Eureka (`eureka-server`)
- [x] Создать модуль `eureka-server` с зависимостью `spring-cloud-starter-netflix-eureka-server`.
- [x] Добавить аннотацию `@EnableEurekaServer`.
- [x] Настроить `application.yml`:
  - Порт: `8761`
  - Отключить саморегистрацию (`eureka.client.register-with-eureka: false`, `fetch-registry: false`).
- [x] Подключить подтягивание конфигурации из `config-server` через `spring.config.import: "configserver:http://localhost:8888"`.
- [x] Проверить: открытие Eureka Dashboard в браузере (`http://localhost:8761`).

### Этап 4: Разработка микросервисов доменной логики

#### 4.1. `user-service` (Клиенты)
- [x] Зависимости: `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `h2` (или PostgreSQL), `spring-cloud-starter-netflix-eureka-client`, `spring-boot-starter-actuator`, `springdoc-openapi-starter-webmvc-ui`.
- [x] Модель данных: сущность `UserEntity` (`id`, `username`, `email`, `fullName`, `createdAt`).
- [x] Репозиторий и DTO (`UserDto`, `CreateUserRequest`).
- [x] REST Контроллер:
  - `POST /api/users` — регистрация клиента.
  - `GET /api/users/{id}` — получение профиля клиента.
  - `GET /api/users` — список клиентов.

#### 4.2. `account-service` (Счета)
- [x] Зависимости: те же, что и у `user-service`.
- [x] Модель данных: сущность `AccountEntity` (`id`, `userId`, `accountNumber`, `balance: BigDecimal`, `currency`, `status`).
- [x] REST Контроллер:
  - `POST /api/accounts` — открытие счета для `userId`.
  - `GET /api/accounts/{id}` — данные счета и текущий баланс.
  - `GET /api/accounts/user/{userId}` — счета конкретного клиента.
  - `PUT /api/accounts/{id}/balance` — изменение баланса (списание/пополнение с валидацией остатка).

#### 4.3. `transaction-service` (Переводы и платежи)
- [x] Зависимости: Web, JPA, H2, Eureka Client, Actuator, SpringDoc, а также `spring-cloud-starter-openfeign` и `spring-cloud-starter-circuitbreaker-resilience4j`.
- [x] Добавить `@EnableFeignClients`.
- [x] Модель данных: сущность `TransactionEntity` (`id`, `idempotencyKey`, `sourceAccountId`, `targetAccountId`, `amount`, `status: SUCCESS / REJECTED / PENDING_FALLBACK`, `timestamp`).
- [x] Создать `AccountClient` (Feign-интерфейс к `account-service`).

### Этап 5: Реализация Circuit Breaker и межсервисной устойчивости
- [x] В `transaction-service` обернуть вызов `AccountClient` в аннотацию `@CircuitBreaker(name = "accountServiceCircuitBreaker", fallbackMethod = "accountFallback")` или CircuitBreakerFactory.
- [x] Реализовать метод `accountFallback(...)`:
  - Фиксация транзакции со статусом `FAILED_SERVICE_UNAVAILABLE` или `PENDING_RETRY`.
  - Возврат пользователю понятного DTO с объяснением, что сервис счетов временно недоступен.
- [x] Настроить параметры Resilience4j в конфигурационном файле `transaction-service.yml`:
  - `slidingWindowSize: 5`
  - `failureRateThreshold: 50%`
  - `waitDurationInOpenState: 10000ms`
  - `permittedNumberOfCallsInHalfOpenState: 3`

### Этап 6: Настройка API Gateway (`api-gateway`)
- [x] Создать модуль `api-gateway` с зависимостями: `spring-cloud-starter-gateway`, `spring-cloud-starter-netflix-eureka-client`, `spring-cloud-starter-circuitbreaker-reactor-resilience4j`, `spring-boot-starter-actuator`.
- [x] Настроить маршрутизацию в `api-gateway.yml`:
  - `/api/users/**` ➔ `lb://user-service`
  - `/api/accounts/**` ➔ `lb://account-service`
  - `/api/transactions/**` ➔ `lb://transaction-service`
- [x] Настроить Gateway Circuit Breaker Filter: если какой-либо сервис не отвечает по таймауту, шлюз перенаправляет на локальный fallback-эндпоинт `/fallback/common`.
- [x] Настроить CORS-фильтр на уровне шлюза.

### Этап 7: Мониторинг, Логирование и API Документация
- [x] **Actuator**:
  - Включить во всех сервисах `management.endpoints.web.exposure.include: "health,info,metrics,circuitbreakers"`.
  - Добавить кастомный индикатор состояния `health` (проверка соединения с БД).
- [x] **Логирование**:
  - Настроить единый формат логов Logback с указанием `[appName, traceId, spanId]`.
  - Добавить логирование входящих запросов в API Gateway через Global Filter (`GatewayFilter`).
  - Добавить информативные логи бизнес-событий в сервисах (создание счета, проведение перевода, срабатывание fallback).
- [x] **Swagger / OpenAPI**:
  - Подключить `springdoc-openapi-starter-webmvc-ui` в сервисах.
  - Настроить Swagger-агрегацию на шлюзе `api-gateway`: на странице `http://localhost:8080/swagger-ui.html` в выпадающем списке можно выбрать спецификацию любого из трех микросервисов (`/v3/api-docs/users`, `/v3/api-docs/accounts`, `/v3/api-docs/transactions`).

---

## 5. План верификации и тестирования (Verification Loop / ECC)

1. **Юнит- и компонентные тесты**:
   - `AccountServiceTest`: тест логики проверки баланса (нельзя списать больше, чем есть на счете).
   - `TransactionServiceTest`: тест идемпотентности (повторный запрос с тем же `idempotencyKey` возвращает сохраненную транзакцию).
2. **Тест Circuit Breaker (Интеграционный)**:
   - Запустить `transaction-service` с заглушкой WireMock для `account-service`.
   - Сымитировать серию ошибок 500 от `account-service`.
   - Убедиться, что Circuit Breaker переходит в состояние `OPEN` и мгновенно возвращает fallback без ожидания сетевого таймаута.
3. **Сквозное E2E тестирование через Gateway**:
   - Скрипт `verify-system.ps1` или `.http` файл:
     1. Создать пользователя `POST :8080/api/users` -> `userId = 1`.
     2. Открыть два счета `POST :8080/api/accounts` для `userId = 1` -> баланс 10 000 руб.
     3. Выполнить перевод 2 000 руб. `POST :8080/api/transactions`.
     4. Проверить балансы счетов через `GET :8080/api/accounts/{id}`.
     5. Остановить процесс `account-service`.
     6. Выполнить перевод и убедиться в получении Fallback ответа.

---

## 6. Порядок запуска проекта

```powershell
# 1. Собрать все модули
mvn clean package -DskipTests

# 2. Порядок запуска терминалов/процессов:
# Терминал 1: Config Server
cd config-server; mvn spring-boot:run
# Терминал 2: Eureka Server
cd eureka-server; mvn spring-boot:run
# Терминалы 3, 4, 5: Бизнес-микросервисы
cd user-service; mvn spring-boot:run
cd account-service; mvn spring-boot:run
cd transaction-service; mvn spring-boot:run
# Терминал 6: API Gateway
cd api-gateway; mvn spring-boot:run
```

