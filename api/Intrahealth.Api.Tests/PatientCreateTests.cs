using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Intrahealth.Api.Tests;

/// <summary>
/// POST /api/patients. Each test builds its own app, so patients added here
/// never leak into another test's list.
/// </summary>
public class PatientCreateTests
{
    private static HttpClient NewClient() => new WebApplicationFactory<Program>().CreateClient();

    private static Dictionary<string, object?> ValidPatient() => new()
    {
        ["givenName"] = "Ada",
        ["familyName"] = "Lovelace",
        ["gender"] = "female",
        ["birthDate"] = "1990-12-10",
        ["phone"] = "+1 416 555 0100",
        ["email"] = "ada@example.com",
        ["address"] = new Dictionary<string, string?>
        {
            ["line"] = "1 Front St",
            ["city"] = "Toronto",
            ["region"] = "ON",
            ["postalCode"] = "M5J 2N8",
        },
    };

    private static async Task<JsonElement> Json(HttpResponseMessage response)
    {
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return document.RootElement.Clone();
    }

    /// <summary>The field errors of a 400 response.</summary>
    private static async Task<string[]> ErrorFields(HttpClient client, Dictionary<string, object?> body)
    {
        var response = await client.PostAsJsonAsync("/api/patients", body);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        return (await Json(response)).GetProperty("errors").EnumerateObject().Select(error => error.Name).ToArray();
    }

    [Fact]
    public async Task Creates_a_patient_with_the_next_id()
    {
        var client = NewClient();

        var response = await client.PostAsJsonAsync("/api/patients", ValidPatient());

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal("/api/patients/p-0013", response.Headers.Location?.ToString());
        var patient = await Json(response);
        Assert.Equal("p-0013", patient.GetProperty("id").GetString());
        Assert.Equal("Lovelace", patient.GetProperty("familyName").GetString());
        Assert.Equal("Toronto", patient.GetProperty("address").GetProperty("city").GetString());
    }

    [Fact]
    public async Task Lists_the_new_patient_and_serves_it_by_id()
    {
        var client = NewClient();
        await client.PostAsJsonAsync("/api/patients", ValidPatient());

        var found = await Json(await client.GetAsync("/api/patients?search=lovelace"));
        var byId = await client.GetAsync("/api/patients/p-0013");

        Assert.Equal("p-0013", Assert.Single(found.EnumerateArray()).GetProperty("id").GetString());
        Assert.Equal(HttpStatusCode.OK, byId.StatusCode);
        Assert.Equal(13, (await Json(await client.GetAsync("/api/patients"))).GetArrayLength());
    }

    [Fact]
    public async Task Stores_blank_optional_values_as_null()
    {
        var body = ValidPatient();
        body["givenName"] = "  Ada  ";
        body["phone"] = " ";
        body["email"] = "";
        body["address"] = new Dictionary<string, string?> { ["line"] = "", ["city"] = " ", ["region"] = null, ["postalCode"] = null };

        var patient = await Json(await NewClient().PostAsJsonAsync("/api/patients", body));

        Assert.Equal("Ada", patient.GetProperty("givenName").GetString());
        Assert.Equal(JsonValueKind.Null, patient.GetProperty("phone").ValueKind);
        Assert.Equal(JsonValueKind.Null, patient.GetProperty("email").ValueKind);
        Assert.Equal(JsonValueKind.Null, patient.GetProperty("address").ValueKind);
    }

    [Fact]
    public async Task Rejects_an_empty_body_with_an_error_per_required_field()
    {
        var fields = await ErrorFields(NewClient(), []);

        Assert.Equal(["givenName", "familyName", "gender", "birthDate"], fields);
    }

    [Theory]
    [InlineData("givenName", " ")]
    [InlineData("familyName", "")]
    [InlineData("gender", "f")]
    [InlineData("birthDate", "02/03/1984")]
    [InlineData("birthDate", "1984-02-30")]
    [InlineData("birthDate", "2999-01-01")]
    [InlineData("email", "ada.example.com")]
    public async Task Rejects_an_invalid_field(string field, string value)
    {
        var body = ValidPatient();
        body[field] = value;

        Assert.Equal([field], await ErrorFields(NewClient(), body));
    }

    [Fact]
    public async Task Stores_nothing_when_rejected()
    {
        var client = NewClient();
        var body = ValidPatient();
        body["gender"] = "nope";

        await client.PostAsJsonAsync("/api/patients", body);

        Assert.Equal(12, (await Json(await client.GetAsync("/api/patients"))).GetArrayLength());
    }
}
