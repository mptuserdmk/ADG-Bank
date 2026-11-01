# ADG-Bank — Microservices Platform (MVP)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Spring Cloud](https://img.shields.io/badge/Spring%20Cloud-2023.0.3-blue.svg)](https://spring.io/projects/spring-cloud)
[![Java](https://img.shields.io/badge/Java-21%2B-orange.svg)](https://openjdk.org/)
[![License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

> **ADG-Bank** — современная отказоустойчивая микросервисная банковская платформа на стеке **Spring Boot 3.3.x** и **Spring Cloud 2023.0.x**.  
> Проект спроектирован с соблюдением строгих стандартов финансовой надежности: детерминированные расчеты без потери точности (`BigDecimal`, банковское округление), идемпотентность финансовых операций, межсервисное взаимодействие через **OpenFeign** и защита от каскадных сбоев с помощью **Resilience4j Circuit Breaker**.

---

## 📌 Текущий статус: MVP (Minimum Viable Product)

Данная версия представляет собой **первый рабочий релиз бэкенд-ядра (MVP)**:
- [x] **Архитектурный каркас**: Централизованный Config Server, Service Discovery (Netflix Eureka), API Gateway (WebFlux).
- [x] **Доменная логика**: Управление профилями клиентов (`user-service`), открытие счетов и ведение баланса (`account-service`), переводы средств (`transaction-service`).
- [x] **Отказоустойчивость**: Resilience4j Circuit Breaker с Fallback-стратегией при отказе downstream-сервисов.
- [x] **Финансовая безопасность**: Защита от повторных списаний (`X-Idempotency-Key`), строгая точность `BigDecimal`.
- [x] **Агрегация API**: Единый Swagger UI на шлюзе для всех сервисов.
- [x] **Сквозная верификация**: Готовые автоматизированные E2E-тесты и сценарии проверки.

*Следующий этап развития:* подключение современного веб-интерфейса в стиле **Revolut** (React 19 + TypeScript + Tailwind CSS) и сервиса нотификаций.

---

## 🏛 Архитектура и топология сервисов

Внешние клиенты взаимодействуют исключительно с **API Gateway**, который балансирует запросы между сервисами с использованием Eureka Service Discovery.

```
                           [ Клиент / Браузер / Swagger UI ]
                                          │
                                          ▼ (HTTP :8080)
                                ┌───────────────────┐
                                │    API GATEWAY    │ ◄─── (Регистрация в Eureka)
                                │   (Spring Cloud)  │ ◄─── (Конфигурация из Config)
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

### Карта портов и модули

| Сервис | Порт | Технологии | Назначение |
| :--- | :--- | :--- | :--- |
| **`config-server`** | `8888` | Spring Cloud Config Server | Централизованная доставка настроек микросервисов (`native` profile). |
| **`eureka-server`** | `8761` | Netflix Eureka Server | Service Registry & Discovery (каталог сервисов). |
| **`api-gateway`** | `8080` | Spring Cloud Gateway, WebFlux | Единая точка входа, маршрутизация (`lb://...`), Gateway Fallback, CORS. |
| **`user-service`** | `8081` | Spring MVC, Spring Data JPA, H2 | Регистрация и управление клиентскими профилями. |
| **`account-service`** | `8082` | Spring MVC, Spring Data JPA, H2 | Открытие банковских счетов, балансы (`BigDecimal`), операции `DEBIT`/`CREDIT`. |
| **`transaction-service`** | `8083` | Spring MVC, OpenFeign, Resilience4j | Переводы между счетами, идемпотентность (`X-Idempotency-Key`), Circuit Breaker. |
| **`common-dto`** | — | Jakarta Validation, Jackson | Общие DTO-контракты и валидаторы между сервисами. |

---

## ⚡ Стандарты финансовой надежности

1. **Точность расчетов**: Никаких `float` и `double` в балансах и суммах переводов. Используется `BigDecimal` с банковским округлением `RoundingMode.HALF_EVEN` (масштаб 2 знака).
2. **Идемпотентность**: Любая операция перевода поддерживает заголовок `X-Idempotency-Key` (UUID). Повторный клик или сбой сети не приведет к дублированию платежа — система вернет уже сохраненную транзакцию.
3. **Resilience4j Circuit Breaker**: Вызовы `transaction-service -> account-service` защищены автоматом состояний. Если сервис счетов временно недоступен, запрос не падает с ошибкой `500`, а переводится в контролируемый статус `PENDING_FALLBACK`.

---

## 🚀 Быстрый старт

### Требования
* **Java**: JDK 17, 21 или 23
* Встроенный Maven Wrapper включен в репозиторий (`mvnw` / `mvnw.cmd`).

### 1. Сборка и установка модулей
```powershell
.\mvnw.cmd clean install -DskipTests
```

### 2. Запуск всей системы (один клик)
Для Windows подготовлен автоматический скрипт запуска всех сервисов в правильной топологической последовательности:
```powershell
.\start-services.ps1
```

*Или ручной запуск в отдельных терминалах:*
```powershell
.\mvnw.cmd -pl config-server spring-boot:run
.\mvnw.cmd -pl eureka-server spring-boot:run
.\mvnw.cmd -pl user-service spring-boot:run
.\mvnw.cmd -pl account-service spring-boot:run
.\mvnw.cmd -pl transaction-service spring-boot:run
.\mvnw.cmd -pl api-gateway spring-boot:run
```

---

## 🧪 Проверка работоспособности и тестирование

### 1. Автоматический E2E Smoke-тест
После старта микросервисов выполните:
```powershell
.\verify-system.ps1
```
Скрипт автоматически создаст клиентов, откроет счета, проведет перевод, проверит дедупликацию по ключу идемпотентности и выведет итоговые балансы.

### 2. Запуск unit-тестов
```powershell
.\mvnw.cmd test
```

### 3. Интерактивный Swagger UI
Откройте в браузере централизованный Swagger UI через API Gateway:  
👉 **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)**  
В выпадающем меню доступны спецификации всех 3 бизнес-сервисов (`Users Service`, `Accounts Service`, `Transactions Service`).

### 4. Дашборд Eureka
👉 **[http://localhost:8761](http://localhost:8761)** — статус регистрации всех инстансов.

### 5. Ручное тестирование через REST Client
Используйте файл [`requests.http`](./requests.http) прямо из вашей IDE для отправки готовых сценариев запросов.

---

## 🧭 Дорожная карта (Roadmap)

- [ ] **Frontend**: Веб-интерфейс в стилистике Revolut (React 19 + TypeScript + Vite + Tailwind CSS + TanStack Query).
- [ ] **Notification Service**: Асинхронная отправка Email/Push-уведомлений о транзакциях (Apache Kafka).
- [ ] **PostgreSQL Migration**: Переход с in-memory H2 на промышленную СУБД PostgreSQL с миграциями Liquibase/Flyway.
- [ ] **Docker Compose**: Контейнеризация всех микросервисов для мгновенного развертывания в облаке.

