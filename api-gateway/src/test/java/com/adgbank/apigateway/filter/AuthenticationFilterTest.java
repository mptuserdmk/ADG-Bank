package com.adgbank.apigateway.filter;

import com.adgbank.apigateway.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthenticationFilterTest {

    private JwtUtil jwtUtil;
    private AuthenticationFilter authenticationFilter;

    @BeforeEach
    void setUp() {
        jwtUtil = mock(JwtUtil.class);
        authenticationFilter = new AuthenticationFilter(jwtUtil);
    }

    @Test
    @DisplayName("Should permit open endpoint /api/users/login without Authorization header")
    void shouldPermitOpenEndpoint() {
        MockServerHttpRequest request = MockServerHttpRequest.post("/api/users/login").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = filterExchange -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        authenticationFilter.apply(new AuthenticationFilter.Config()).filter(exchange, chain).block();

        assertThat(chainCalled.get()).isTrue();
        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    @Test
    @DisplayName("Should return 401 when Authorization header is missing on secured endpoint")
    void shouldReturn401WhenHeaderMissing() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/accounts/1").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        AtomicBoolean chainCalled = new AtomicBoolean(false);
        GatewayFilterChain chain = filterExchange -> {
            chainCalled.set(true);
            return Mono.empty();
        };

        authenticationFilter.apply(new AuthenticationFilter.Config()).filter(exchange, chain).block();

        assertThat(chainCalled.get()).isFalse();
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should validate JWT and add X-User-Id header for downstream request")
    void shouldForwardWithUserIdHeader() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/accounts/1")
                .header(HttpHeaders.AUTHORIZATION, "Bearer valid-jwt-token")
                .build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);

        when(jwtUtil.isTokenValid("valid-jwt-token")).thenReturn(true);
        when(jwtUtil.extractUserId("valid-jwt-token")).thenReturn(100L);
        when(jwtUtil.extractUsername("valid-jwt-token")).thenReturn("alex_dev");

        AtomicReference<ServerWebExchange> mutatedExchange = new AtomicReference<>();
        GatewayFilterChain chain = filterExchange -> {
            mutatedExchange.set(filterExchange);
            return Mono.empty();
        };

        authenticationFilter.apply(new AuthenticationFilter.Config()).filter(exchange, chain).block();

        assertThat(mutatedExchange.get()).isNotNull();
        String forwardedUserId = mutatedExchange.get().getRequest().getHeaders().getFirst("X-User-Id");
        String forwardedUserName = mutatedExchange.get().getRequest().getHeaders().getFirst("X-User-Name");

        assertThat(forwardedUserId).isEqualTo("100");
        assertThat(forwardedUserName).isEqualTo("alex_dev");
    }
}

