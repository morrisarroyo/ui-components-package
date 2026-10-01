# API Contract

What the mock API (`api`) serves and the website (`app`) expects. If they
disagree, fix this document first.

- The browser calls `/api/...` on the website's own address. In development
  the dev server forwards it to `http://localhost:5080`; when hosted, one
  container serves both. So the website holds no host or port and needs no
  Cross-Origin Resource Sharing (CORS).
- The data is invented and in memory: no database, no authentication, nothing
  kept between runs.
- It is not FHIR (Fast Healthcare Interoperability Resources, the healthcare
  data standard). Payloads are the smallest shape the three pages need.

## Resource: Patient

```json
{
  "id": "p-0001",
  "givenName": "Amara",
  "familyName": "Okonkwo",
  "gender": "female",
  "birthDate": "1984-03-02",
  "phone": "+1 416 555 0133",
  "email": "amara.okonkwo@example.com",
  "address": {
    "line": "412 Wellesley St E",
    "city": "Toronto",
    "region": "ON",
    "postalCode": "M4X 1H2"
  }
}
```

| Field | Type | Nullable | Notes |
| --- | --- | --- | --- |
| `id` | string | No | Used in the detail route. Treat as opaque. |
| `givenName` | string | No | |
| `familyName` | string | No | |
| `gender` | string | No | One of `female`, `male`, `other`, `unknown`. |
| `birthDate` | string | No | `YYYY-MM-DD`: a date, with no time or timezone. |
| `phone` | string | **Yes** | |
| `email` | string | **Yes** | |
| `address` | object | **Yes** | `line`, `city`, `region`, `postalCode`: strings, each nullable. |

Nullable fields are sent as `null`, never left out. There is no `name` or
one-line address field; the website builds those (see
[Display mapping](#display-mapping)).

## Endpoints

### `GET /api/patients`

Every patient, or those matching `search`.

| Query parameter | Required | Behaviour |
| --- | --- | --- |
| `search` | No | Case-insensitive partial match against the given name, the family name, and `"given family"`. Empty or blank means no filter. |

**200 OK**: an array of Patient. No match is `200` with `[]`, never a 404.

```
GET /api/patients?search=oko
GET /api/patients?search=amara%20oko
```

### `GET /api/patients/{id}`

- **200 OK**: one Patient.
- **404 Not Found**: no patient has that id. The body is ASP.NET Core's
  standard `ProblemDetails` (ASP.NET Core is the C# web framework):

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Not Found",
  "status": 404,
  "detail": "No patient with id 'p-9999'."
}
```

### `POST /api/patients`

Registers a patient. Send a Patient without `id`. The API assigns the next
free id (`p-0013`, …) and keeps the patient until it stops.

- **201 Created**: the stored Patient, with `Location: /api/patients/{id}`.
  Values are trimmed. Blank optional values, and an all-blank address, are
  stored as `null`.
- **400 Bad Request**: a standard `ValidationProblemDetails`, with one message
  per invalid field, keyed by its JSON name. Nothing is stored.

| Field | Rule |
| --- | --- |
| `givenName`, `familyName` | Required, not blank. |
| `gender` | One of the four values above. |
| `birthDate` | A real `YYYY-MM-DD` date, not after today's date in UTC (Coordinated Universal Time). |
| `email` | Optional; when given, shaped like `name@example.com`. |

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": { "birthDate": ["Enter a date as YYYY-MM-DD."] }
}
```

### `GET /health`

**200 OK** with `ok`. Shows the API is up; the website doesn't call it.

## Errors and how the website reacts

| Situation | API | Website |
| --- | --- | --- |
| Search matches nothing | `200` with `[]` | The table says "No patients match your search". |
| No patients at all, before any search | `200` with `[]` | The table says "No patients yet". |
| Unknown path under `/api` | `404`, empty body | Not called by the website. |
| Unknown patient id | `404` | A card titled "Patient not found", with Back. |
| API down, network failure, or another error on a read | No response or `5xx` | A card titled "Something went wrong" instead of the content. |
| Registering with invalid input | `400` | Each error shows on its field. |
| Registering fails any other way | No response or `5xx` | A card titled "Something went wrong"; the form keeps its values. |

## Display mapping

One module in `app`, `src/api/patients.ts`, turns payloads into display
values. Only it knows API field names or decides a value is missing. A blank
string counts as missing.

| Display label | From | Rule |
| --- | --- | --- |
| Name | `givenName`, `familyName` | Joined with a space. |
| Gender | `gender` | First letter capitalised: `female` → "Female". An unknown value passes through unchanged. |
| Birth date | `birthDate` | `1984-03-02` → "2 Mar 1984". Read from the text, never through a timezone, which can shift it a day. |
| Phone | `phone` | As given. |
| Email | `email` | As given. |
| Address | `address` | Present parts joined with `", "`, in the order line, city, region, postalCode. No present parts means missing. |

For a missing value on the patient record, the mapping passes `null` and
`DescriptionList` draws the `—`. `Table` shows cells as given, so for a list
row the mapping writes the `—` itself.
