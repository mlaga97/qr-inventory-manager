#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER inventory;
  CREATE DATABASE inventory;
  GRANT ALL PRIVILEGES ON DATABASE inventory TO inventory;

  # TODO: Split into multiple tables
  CREATE TABLE tags ( uuid UUID PRIMARY KEY, containertype TEXT, label TEXT, parent TEXT, comment TEXT, labelprinted BOOLEAN);

  CREATE TABLE tagmetadata (uuid UUID PRIMARY KEY, lastscanned TIMESTAMP, lastupdated TIMESTAMP);

  CREATE TABLE locations (
  );

  CREATE TABLE containerTypes (
  );
EOSQL
