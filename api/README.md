# Mock API

## Summary

Invented patient data for the example website, the healthcare screens built
from the `ui` components. Data lives in memory: no database, no login.

## Quick start

From the repository root (prerequisites: [project README](../README.md#quick-start)):

```bash
npm run api                    # serves on http://localhost:5080
```

Try every endpoint at <http://localhost:5080/api/swagger>, or the
[live copy](https://ui-components-package.onrender.com/api/swagger).

## Tech stack

C# on .NET 10, Swagger docs and xUnit tests.

## Endpoints

| Endpoint | Returns |
| --- | --- |
| `GET /api/patients` | Every patient. |
| `GET /api/patients?search=oko` | Patients whose name contains the text, any case; `[]` if none. |
| `GET /api/patients/{id}` | One patient, or `404`. |
| `POST /api/patients` | `201` with the new patient, or `400` with an error per field. Lost on restart. |
| `GET /health` | `ok`. |
| `GET /api/swagger` | The Swagger page. |

Some seed patients have no email, phone or address, so the website's "—" shows.
Payload shapes: [`docs/API-CONTRACT.md`](../docs/API-CONTRACT.md).

## Port

The website's dev server expects port 5080. To use another, pass `--urls` or
set `ASPNETCORE_URLS`:

```bash
dotnet run --project api/Intrahealth.Api --urls http://localhost:5099
```

## Tests

```bash
npm run test:api               # same as: dotnet test api/Intrahealth.Api.Tests
```

Coverage: [docs/TESTING.md](../docs/TESTING.md).

## Files

| Path | What it holds |
| --- | --- |
| `Intrahealth.Api/Program.cs` | The endpoints, and serving the website and docs when hosted. |
| `Intrahealth.Api/SeedData.cs` | The invented patients. |
| `Intrahealth.Api/Patient.cs` | The patient record. |
| `Intrahealth.Api/PatientStore.cs` | Patients in memory, seeded and registered. |
| `Intrahealth.Api/NewPatient.cs` | The `POST` body and its rules. |
| `Intrahealth.Api.Tests/` | The tests. |

## Contributing

To add an endpoint:

1. Describe it in [`docs/API-CONTRACT.md`](../docs/API-CONTRACT.md), the
   contract the website and API share.
2. Add it to `Intrahealth.Api/Program.cs`, under `/api`.
3. Test it in `Intrahealth.Api.Tests/`.
