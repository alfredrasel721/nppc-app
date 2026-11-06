# Non-Functional Requirements

## Reliability

Target 99.9% backend availability after launch; show stale data and timestamps; queue idempotent rule updates offline; never claim live monitoring when connection is lost.

## Performance

Initial parent dashboard p95 under 3 seconds on test network; cached screen loads under 1 second; rule sync target under 30 seconds online, measured by device ack; SOS attempt immediately, retry and show delivery state.

## Security

TLS 1.2+, short-lived tokens, scoped roles, encryption at rest, minimum access, audited sensitive actions, secure deletion, automated vulnerability scanning.

## Privacy

Collect only needed data; short configurable retention; age-appropriate notices; user-controlled exports/deletion; no raw screen/camera/audio recordings by default.

## Quality

Crash-free sessions goal ≥99.5%; accessibility WCAG-inspired contrast/touch sizes, TalkBack, dynamic text; Android matrix maintained; targets verified in QA rather than asserted.
