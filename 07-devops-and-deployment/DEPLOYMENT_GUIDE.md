# Deployment Guide

## Backend

Build image, run migration with backup, deploy to staging, smoke-test auth, pairing, rule sync, SOS, billing verifier and privacy endpoints, then promote with approval.

## Android

Build two distinct AABs with separate application IDs, listings and signing. Internal/closed testing before production. Publish only features supported by policy and tested Android versions.

## Rollback

Backend image rollback and backward-compatible migrations; Android phased rollout halt; feature flags to disable sensitive features without disabling SOS or free limits.
