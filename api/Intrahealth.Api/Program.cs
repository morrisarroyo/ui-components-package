// The mock API: invented patient data held in memory, no database and no
// authentication. The contract it implements is docs/API-CONTRACT.md.
using Intrahealth.Api;

var builder = WebApplication.CreateBuilder(args);

// Port 5080 by default, matching the website's dev-server proxy
// (packages/app/vite.config.ts), whether or not a launch profile is used.
// Anything that sets the URL explicitly (--urls, ASPNETCORE_URLS, the launch
// profile) still wins.
if (string.IsNullOrEmpty(builder.Configuration["urls"]))
{
    builder.WebHost.UseUrls("http://localhost:5080");
}

// Swagger: the OpenAPI description at /api/swagger/v1/swagger.json and a
// page to read and try every endpoint at /api/swagger. Under /api so the
// website's dev proxy and the hosted container both reach it.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
    options.SwaggerDoc("v1", new() { Title = "Mock patient API", Version = "v1" }));

// Every patient, seed data first, for the life of the process.
builder.Services.AddSingleton<PatientStore>();

var app = builder.Build();

app.UseSwagger(options => options.RouteTemplate = "api/swagger/{documentName}/swagger.json");
app.UseSwaggerUI(options =>
{
    options.RoutePrefix = "api/swagger";
    options.SwaggerEndpoint("v1/swagger.json", "Mock patient API v1");
});

// In the hosted container, wwwroot holds the built website and, under docs/,
// the component docs site (see Dockerfile). Locally there is no wwwroot and
// these do nothing. Routing comes after them so the fallback below cannot
// claim /docs/ before it is mapped to docs/index.html.
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseRouting();

app.MapGet("/health", () => "ok").ExcludeFromDescription();

// All patients, or those whose given name, family name, or the two joined as
// "given family" contain the search text, ignoring case. An absent, empty or
// whitespace-only search means no filter. No match is 200 with [], never 404:
// an empty search result is not an error.
app.MapGet("/api/patients", (string? search, PatientStore store) =>
{
    var term = search?.Trim();
    if (string.IsNullOrEmpty(term))
    {
        return Results.Ok(store.All());
    }

    var matches = store.All()
        .Where(patient => Matches(patient, term))
        .ToList();
    return Results.Ok(matches);
})
.WithSummary("List patients, optionally filtered by name")
.Produces<List<Patient>>();

// One patient by id, or 404 with the standard ProblemDetails body.
app.MapGet("/api/patients/{id}", (string id, PatientStore store) =>
{
    var patient = store.Find(id);
    return patient is null
        ? Results.Problem(statusCode: StatusCodes.Status404NotFound, detail: $"No patient with id '{id}'.")
        : Results.Ok(patient);
})
.WithSummary("Get one patient by id")
.Produces<Patient>()
.ProducesProblem(StatusCodes.Status404NotFound);

// A new patient, given an id and kept in memory until the process stops.
// Invalid input is 400 with one error per field, keyed by its JSON name.
app.MapPost("/api/patients", (NewPatient patient, PatientStore store) =>
{
    var errors = patient.Validate(DateOnly.FromDateTime(DateTime.UtcNow));
    if (errors.Count > 0)
    {
        return Results.ValidationProblem(errors);
    }

    var created = store.Add(patient);
    return Results.Created($"/api/patients/{created.Id}", created);
})
.WithSummary("Register a new patient")
.Produces<Patient>(StatusCodes.Status201Created)
.ProducesValidationProblem();

// The website's own routes, such as /patients/p-0003, load its index.html so
// the client router can take over. Unknown /api paths stay a 404 instead.
app.MapFallback("/api/{**path}", () => Results.NotFound());
app.MapFallbackToFile("index.html");

app.Run();

static bool Matches(Patient patient, string term) =>
    patient.GivenName.Contains(term, StringComparison.OrdinalIgnoreCase)
    || patient.FamilyName.Contains(term, StringComparison.OrdinalIgnoreCase)
    || $"{patient.GivenName} {patient.FamilyName}".Contains(term, StringComparison.OrdinalIgnoreCase);

// Makes the entry point visible to the test project's WebApplicationFactory.
public partial class Program;
