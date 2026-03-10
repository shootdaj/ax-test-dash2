# ax-test-dash2

Real-time analytics dashboard with simulated server metrics.

## Project Structure
- `src/` — Backend source code (Express app, simulator, store, aggregation, alerts)
- `public/` — Frontend static files (HTML, CSS, JS)
- `api/index.js` — Vercel serverless entry point
- `test/` — Test files (unit, integration, scenarios)

# Testing Requirements (AX)

Every feature implementation MUST include tests at all three tiers:

## Test Tiers
1. **Unit tests** — Test individual functions/methods in isolation. Mock external dependencies.
2. **Integration tests** — Test component interactions with real services via docker-compose.test.yml.
3. **Scenario tests** — Test full user workflows end-to-end.

## Test Naming
Use semantic names: `Test<Component>_<Behavior>[_<Condition>]`
- Good: `TestAuthService_LoginWithValidCredentials`, `TestFullCheckoutFlow`
- Bad: `TestShouldWork`, `Test1`, `TestGivenUserWhenLoginThenSuccess`

## Reference
- See `TEST_GUIDE.md` for requirement-to-test mapping
- See `.claude/ax/references/testing-pyramid.md` for full methodology
- Every requirement in ROADMAP.md must map to at least one scenario test
