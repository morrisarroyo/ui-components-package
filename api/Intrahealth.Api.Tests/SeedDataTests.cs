using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Intrahealth.Api.Tests;

/// <summary>
/// The seed data has to exercise the website's missing-value path, so the
/// deliberately incomplete records are pinned here, as the client sees them.
/// </summary>
public class SeedDataTests(WebApplicationFactory<Program> factory) : ApiTests(factory)
{
    [Theory]
    [InlineData("p-0003", "email")]
    [InlineData("p-0005", "address")]
    [InlineData("p-0007", "phone")]
    public async Task Sends_a_missing_field_as_an_explicit_null(string id, string field)
    {
        var patient = await GetJson($"/api/patients/{id}");

        Assert.True(patient.TryGetProperty(field, out var value), $"{field} was omitted rather than null");
        Assert.Equal(JsonValueKind.Null, value.ValueKind);
    }

    [Fact]
    public async Task Has_a_patient_with_a_partial_address()
    {
        var address = (await GetJson("/api/patients/p-0009")).GetProperty("address");

        Assert.Equal(JsonValueKind.Null, address.GetProperty("line").ValueKind);
        Assert.Equal("Ottawa", address.GetProperty("city").GetString());
        Assert.Equal(JsonValueKind.Null, address.GetProperty("postalCode").ValueKind);
    }

    [Fact]
    public async Task Has_a_patient_whose_address_parts_are_all_null()
    {
        var address = (await GetJson("/api/patients/p-0011")).GetProperty("address");

        Assert.All(address.EnumerateObject(), part => Assert.Equal(JsonValueKind.Null, part.Value.ValueKind));
    }

    [Fact]
    public async Task Keeps_every_patient_inside_the_contract()
    {
        var patients = (await GetJson("/api/patients")).EnumerateArray().ToArray();
        string[] genders = ["female", "male", "other", "unknown"];

        Assert.Equal(patients.Length, patients.Select(patient => patient.GetProperty("id").GetString()).Distinct().Count());
        Assert.All(patients, patient =>
        {
            Assert.Contains(patient.GetProperty("gender").GetString(), genders);
            Assert.Matches(new Regex(@"^\d{4}-\d{2}-\d{2}$"), patient.GetProperty("birthDate").GetString());
            Assert.False(string.IsNullOrWhiteSpace(patient.GetProperty("givenName").GetString()));
            Assert.False(string.IsNullOrWhiteSpace(patient.GetProperty("familyName").GetString()));
        });
    }
}
