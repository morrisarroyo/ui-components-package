# API Contract

The single contract that `api` implements and `app` consumes. When the two
disagree, this document is what gets fixed first.

**Base URL (development):** `http://localhost:5080`
**Served to the browser as:** `/api/...` — the website's dev server proxies
`/api` to the API process, so the client code contains no host or port.

The API is a mock: invented data held in memory, no database, no
authentication, no persistence between runs. It is not FHIR; FHIR conformance
is explicitly not assessed, so the payloads are the smallest shape that serves
the two pages honestly.

## Resource: Patient

```jsonc
{
  "id": "p-0001",                  // string, stable, opaque to the client
  "givenName": "Amara",            // string, always present
  "familyName": "Okonkwo",         // string, always present
  "gender": "female",              // string enum, always present
  "birthDate": "1984-03-02",       // string, ISO 8601 date (no time), always present
  "phone": "+1 416 555 0133",      // string or null
  "email": "amara.okonkwo@example.com", // string or null
  "address": {                     // object or null
    "line": "412 Wellesley St E",  // string or null
    "city": "Toronto",             // string or null
    "region": "ON",                // string or null
    "postalCode": "M4X 1H2"        // string or null
  }
}
```

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| `id` | string | No | Used in the detail route. Treat as opaque. |
| `givenName` | string | No | |
| `familyName` | string | No | |
| `gender` | string | No | One of `female`, `male`, `other`, `unknown`. |
| `birthDate` | string | No | `YYYY-MM-DD`. Date only — no time, no timezone. |
| `phone` | string | **Yes** | |
| `email` | string | **Yes** | |
| `address` | object | **Yes** | Every field inside it is independently nullable. |

There is deliberately no `name` field and no `displayAddress`. Composing a full
name and a one-line address is the website's job, done once in its mapping
layer — see "Display mapping" below.

Nullable fields are serialised as JSON `null`, not omitted, so the client can
tell "absent" from "the server forgot".

## Endpoints

### `GET /api/patients`

Returns every patient, or those matching a search.

| Query parameter | Type | Required | Behaviour |
| --- | --- | --- | --- |
| `search` | string | No | Case-insensitive **partial** match against the given name, the family name, and the two joined as `"given family"`. Absent, empty or whitespace-only means "no filter". |

**200 OK** — a JSON array of Patient, possibly empty. An empty result is a
successful response with `[]`, never a 404: "no patients match your search" is
not an error.

```
GET /api/patients
GET /api/patients?search=oko
GET /api/patients?search=amara%20oko
```

### `GET /api/patients/{id}`

Returns one patient.

- **200 OK** — a single Patient object.
- **404 Not Found** — no patient with that id. Body is ASP.NET Core's standard
  `ProblemDetails`. The website distinguishes this from a transport failure: a
  404 shows "Patient not found", anything else shows the generic error state.

```jsonc
// 404 body
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Not Found",
  "status": 404,
  "detail": "No patient with id 'p-9999'."
}
```

### `POST /api/patients`

Registers a new patient. The body is a Patient without `id`. The API assigns
the next free id (`p-0013`, …) and keeps the patient in memory until it stops.

- **201 Created** — the stored Patient, with `Location: /api/patients/{id}`.
  Values are trimmed; a blank optional value is stored as `null`, and so is an
  address whose parts are all blank.
- **400 Bad Request** — ASP.NET Core's `ValidationProblemDetails`, one message
  per invalid field, keyed by its JSON name. Nothing is stored.

| Field | Rule |
| --- | --- |
| `givenName`, `familyName` | Required, not blank. |
| `gender` | One of `female`, `male`, `other`, `unknown`. |
| `birthDate` | A real date as `YYYY-MM-DD`, not in the future. |
| `email` | Optional; when given, shaped like `name@example.com`. |

```jsonc
// 400 body
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": { "birthDate": ["Enter a date as YYYY-MM-DD."] }
}
```

### `GET /health`

**200 OK**, body `"ok"`. Not used by the website; it exists so the API can be
confirmed up without reasoning about the data.

## Errors and how the website reacts

| Situation | API | Website |
| --- | --- | --- |
| Search matches nothing | `200` with `[]` | Table shows "No patients match your search" |
| Unknown patient id | `404` + ProblemDetails | Card titled "Patient not found", Back button still present |
| API not running, network failure, non-2xx on the list | no response / `5xx` | Card titled "Something went wrong" instead of the Table |
| Registering with invalid input | `400` + field errors | Each error shown on its field |
| Registering fails any other way | no response / `5xx` | Card titled "Something went wrong"; the form keeps its values |

## Display mapping

The API returns data; the pages show strings. The translation happens in
exactly one module in `app`, and that module is the only place that knows an
API field name. It is also where every missing value is handled, so no page
ever renders `undefined`.

| Display label | Derived from | Rule |
| --- | --- | --- |
| Name | `givenName`, `familyName` | Joined with a single space. |
| Gender | `gender` | First letter capitalised: `female` → "Female". An unrecognised value passes through unchanged rather than being dropped. |
| Birth date | `birthDate` | Formatted for display from the ISO date. Parsed as a plain date — never through a timezone-aware conversion, which can shift it by a day. |
| Phone | `phone` | As given. |
| Email | `email` | As given. |
| Address | `address` | Non-null parts joined with `", "` in the order line, city, region, postalCode. An address whose parts are all null is treated as missing. |

A value that is missing is passed to `DescriptionList` as `null`, and the
component renders the em dash. The mapping layer does **not** substitute the
`—` itself — rendering a missing value is the library's job, and doing it in
both places would mean two definitions of "missing".

## CORS

Not configured, and not needed: the browser only ever talks to the website's
own origin, which proxies to the API in development.
