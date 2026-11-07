# Contract: FAQ list

The FAQ service already exists in `src/services/faqService.ts` and is reused unchanged.

| Item | Value |
|---|---|
| Call | `POST FormBasedQuery/Services/v1/fetch-faq` through the shared HTTP client |
| Base URL | bare API host from build config (`ENV.apiBaseUrl`) |
| Body | `{}` |
| Headers | Bearer token, `app-version`, `platform`, `device-details`; no `X-BHFL-Auth` |
| Success | an array of `{ question: string, answer: string }` |
| Non-array body | treated as `[]` by the service |
| Failure | network, timeout, 4xx, 5xx reject; the body is never parsed |

## Screen rules

- An item with a missing or blank `question` is left out; `answer` may be empty or missing.
- `answer` may contain simple HTML; see `spec.md` FR-012.
- Only this call feeds the screen. No Track Application call.
