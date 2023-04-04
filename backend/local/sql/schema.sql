DROP SCHEMA IF EXISTS public CASCADE;

CREATE SCHEMA public;

SET search_path = public;

CREATE TABLE arbitrageTxs (
                       id serial PRIMARY KEY,
                       hash varchar NOT NULL,
                       pool0 int NOT NULL,
                       pool1 int NOT NULL,
                       used varchar NOT NULL,
                       profits varchar NOT NULL,
                       createdAt timestamp NOT NULL
);