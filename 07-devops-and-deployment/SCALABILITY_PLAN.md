# Scalability Plan

## Stage 1

Modular backend, PostgreSQL indexes, worker queue for notifications and retention.

## Stage 2

Read replicas, partitioned time-series records, object storage only if approved, load testing and per-family rate limits.

## Media

Ephemeral consented live sessions require separate capacity and abuse controls; no recording pipeline by default.
