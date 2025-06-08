#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE USER servagre WITH PASSWORD 'servagre';
	CREATE DATABASE servagre;

	CREATE USER test WITH PASSWORD 'test';
	CREATE DATABASE test;
EOSQL
