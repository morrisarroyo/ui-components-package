// The mock API: invented patient data held in memory, no database and no
// authentication. The contract it implements is docs/API-CONTRACT.md.
using Intrahealth.Api;

var builder = WebApplication.CreateBuilder(args);

// Fixed port, matching the website's dev-server proxy (packages/app/vite.config.ts).
// Set here as well as in launchSettings.json so `dotnet run` with any profile,
// or none, still lands on it.
builder.WebHost.UseUrls("http://localhost:5080");

var app = builder.Build();

app.MapGet("/health", () => "ok");

// All patients, or those whose given name, family name, or the two joined as
// "given family" contain the search text, ignoring case. An absent, empty or
// whitespace-only search means no filter. No match is 200 with [], never 404:
// an empty search result is not an error.
app.MapGet("/api/patients", (string? search) =>
{
    var term = search?.Trim();
    if (string.IsNullOrEmpty(term))
    {
        return Results.Ok(SeedData.Patients);
    }

    var matches = SeedData.Patients
        .Where(patient => Matches(patient, term))
        .ToList();
    return Results.Ok(matches);
});

// One patient by id, or 404 with the standard ProblemDetails body.
app.MapGet("/api/patients/{id}", (string id) =>
{
    var patient = SeedData.Patients.FirstOrDefault(candidate => candidate.Id == id);
    return patient is null
        ? Results.Problem(statusCode: StatusCodes.Status404NotFound, detail: $"No patient with id '{id}'.")
        : Results.Ok(patient);
});

app.Run();

static bool Matches(Patient patient, string term) =>
    patient.GivenName.Contains(term, StringComparison.OrdinalIgnoreCase)
    || patient.FamilyName.Contains(term, StringComparison.OrdinalIgnoreCase)
    || $"{patient.GivenName} {patient.FamilyName}".Contains(term, StringComparison.OrdinalIgnoreCase);

// Makes the entry point visible to the test project's WebApplicationFactory.
public partial class Program;
