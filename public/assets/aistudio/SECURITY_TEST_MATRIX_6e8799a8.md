# Security Test Matrix

- [ ] Cross-family access denied on every endpoint and FCM event.
- [ ] Co-guardian cannot escalate scope or manage another family.
- [ ] Child cannot impersonate guardian, approve own extra time, or mint subscription.
- [ ] Parent cannot forge child live-session consent or bypass OS prompt.
- [ ] No screen/camera/mic capture after decline, timeout, stop, permission revocation or refund.
- [ ] No sensitive media or notification bodies in logs, push messages, analytics or backups.
- [ ] Free features work when subscription missing, expired, refunded or payment unavailable.
- [ ] Pairing codes one-time, expiring, rate-limited and protected against replay.
- [ ] SOS works during downtime and does not depend on Premium.
- [ ] Deletion/export limited to verified authorized guardians; support audit and JIT scope enforced.
