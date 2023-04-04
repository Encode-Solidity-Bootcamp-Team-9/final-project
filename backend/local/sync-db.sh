#!/bin/bash

SCRIPTS_DIR=`dirname "$0"`

cat "$SCRIPTS_DIR/sql/schema.sql" "$SCRIPTS_DIR/sql/seed.sql" \
    | docker exec -i somedb psql -U postgres -d somedb




