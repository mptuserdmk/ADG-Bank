package com.adgbank.apigateway.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class LoggingGlobalFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(LoggingGlobalFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();
        String method = exchange.getRequest().getMethod().name();
        long startTime = System.currentTimeMillis();

        log.info("API Gateway -> Incoming request: {} {}", method, path);

        return chain.filter(exchange).then(Mono.fromRunnable(() -> {
            long duration = System.currentTimeMillis() - startTime;
            var statusCode = exchange.getResponse().getStatusCode();
            log.info("API Gateway <- Outgoing response: {} {} -> [Status: {}] ({}ms)",
                    method, path, statusCode != null ? statusCode.value() : "unknown", duration);
        }));
    }

    @Override
    public int getOrder() {
        return -1; // High priority in filter chain
    }
}

