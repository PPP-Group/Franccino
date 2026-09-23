#!/usr/bin/env sh
set -e
mysql --user=root --password="$MYSQL_ROOT_PASSWORD" <<-EOSQL
  CREATE DATABASE IF NOT EXISTS franccino_testing;
  GRANT ALL PRIVILEGES ON franccino_testing.* TO '$MYSQL_USER'@'%';
EOSQL
