#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER servagre WITH PASSWORD 'servagre';
	CREATE DATABASE servagre;
	GRANT ALL PRIVILEGES ON DATABASE servagre TO servagre;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "servagre" <<-EOSQL
	GRANT ALL PRIVILEGES ON SCHEMA public TO servagre;
EOSQL

# psql -v ON_ERROR_STOP=1 --username "servagre" --dbname "servagre" <<-EOSQL
# 	CREATE SCHEMA servagre;
# EOSQL