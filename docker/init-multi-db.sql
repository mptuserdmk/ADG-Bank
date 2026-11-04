-- ============================================================================
-- ADG-QuantumBank: Multi-Database Initialization Script
-- Executed on container startup by PostgreSQL in /docker-entrypoint-initdb.d
-- ============================================================================

CREATE DATABASE users_db;
CREATE DATABASE vault_db;
CREATE DATABASE wallets_db;
CREATE DATABASE tx_db;

\connect users_db;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;

\connect vault_db;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;

\connect wallets_db;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;

\connect tx_db;
GRANT ALL PRIVILEGES ON SCHEMA public TO postgres;

