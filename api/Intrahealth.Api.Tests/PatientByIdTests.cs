using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Intrahealth.Api.Tests;

public class PatientByIdTests(WebApplicationFactory<Program> factory) : ApiTests(factory)
{
    [Fact]
    public async Task Returns_the_patient_with_that_id()
    {
        var patient = await GetJson("/api/patients/p-0001");

        Assert.Equal("p-0001", patient.GetProperty("id").GetString());
        Assert.Equal("Amara", patient.GetProperty("givenName").GetString());
        Assert.Equal("Okonkwo", patient.GetProperty("familyName").GetString());
        Assert.Equal("female", patient.GetProperty("gender").GetString());
        Assert.Equal("1984-03-02", patient.GetProperty("birthDate").GetString());
        Assert.Equal("Toronto", patient.GetProperty("address").GetProperty("city").GetString());
    }

    [Fact]
    public async Task Answers_an_unknown_id_with_404_and_problem_details()
    {
        var response = await Client.GetAsync("/api/patients/p-9999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal(404, body.RootElement.GetProperty("status").GetInt32());
        Assert.Equal("Not Found", body.RootElement.GetProperty("title").GetString());
        Assert.Equal("No patient with id 'p-9999'.", body.RootElement.GetProperty("detail").GetString());
    }

    [Fact]
    public async Task Matches_the_id_exactly_not_ignoring_case()
    {
        var response = await Client.GetAsync("/api/patients/P-0001");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Health_answers_ok()
    {
        var response = await Client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("ok", await response.Content.ReadAsStringAsync());
    }
}
