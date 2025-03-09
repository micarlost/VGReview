-- Enable dblink extension
CREATE EXTENSION IF NOT EXISTS dblink;

DROP DATABASE IF EXISTS csudh_test;
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'megatron') THEN
        PERFORM dblink_exec('dbname=postgres', 'CREATE DATABASE megatron');
    END IF;

    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'megatron') THEN
        PERFORM dblink_exec('dbname=postgres', 'CREATE DATABASE megatron');
    END IF;
END
$$;