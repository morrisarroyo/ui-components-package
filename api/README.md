# Mock API

## Summary

Invented patient data for the example website, the healthcare screens built
from the `ui` components: a clinic's patient list and a patient's record.
Data is held in memory, with no database and no authentication.

## Quick start

Needs the .NET 10 SDK. From the repository root:

```bash
npm run api                    # serves on http://localhost:5080
```

Open <http://localhost:5080/api/swagger> to read every endpoint and try it
in the browser. Or use the live copy:
<https://ui-components-package.onrender.com/api/swagger>. It sleeps when
idle, so the first request can take about a minute.

## Tech stack

ASP.NET Core minimal API on .NET 10, Swagger docs from Swashbuckle, and xUnit
tests that run the real app in memory.

## Endpoints

| Endpoint | Returns |
| --- | --- |
| `GET /api/patients` | Every patient. |
| `GET /api/patients?search=oko` | Patients whose name contains the text, ignoring case; `[]` if none. |
| `GET /api/patients/{id}` | One patient, or `404` with a `ProblemDetails` body. |
| `POST /api/patients` | Registers a patient: `201` with it, or `400` with an error per field. Kept until the API stops. |
| `GET /health` | `ok`. |
| `GET /api/swagger` | The Swagger page. The OpenAPI description is at `/api/swagger/v1/swagger.json`. |

Some seed patients lack an email, phone or address, so the website's missing
values can be seen. The payload shapes are in
[`docs/API-CONTRACT.md`](../docs/API-CONTRACT.md).

## Port

The API listens on 5080, the port the website's dev server forwards `/api`
to. To use another, pass `--urls` or set `ASPNETCORE_URLS`:

```bash
dotnet run --project api/Intrahealth.Api --urls http://localhost:5099
```

## Tests

```bash
npm run test:api               # same as: dotnet test api/Intrahealth.Api.Tests
```

They cover every endpoint, the search rules, the 404 body, the JSON shape and
the Swagger docs, run in memory against the real app. All the project's tests:
[TESTING.md](../TESTING.md).

## Files

| Path | What it holds |
| --- | --- |
| `Intrahealth.Api/Program.cs` | The endpoints, Swagger, and serving the built website and docs when hosted. |
| `Intrahealth.Api/SeedData.cs` | The invented patients. |
| `Intrahealth.Api/Patient.cs` | The patient record the endpoints return. |
| `Intrahealth.Api/PatientStore.cs` | Every patient in memory: the seed data plus registered ones. |
| `Intrahealth.Api/NewPatient.cs` | The body of `POST /api/patients`, and its rules. |
| `Intrahealth.Api.Tests/` | The xUnit tests. |

## Contributing

To add an endpoint:

1. Describe it in [`docs/API-CONTRACT.md`](../docs/API-CONTRACT.md) first;
   the website and the API share that contract.
2. Map it in `Intrahealth.Api/Program.cs` under `/api`.
3. Test it in `Intrahealth.Api.Tests/` and run `npm run test:api`.
