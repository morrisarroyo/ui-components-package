using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Intrahealth.Api.Tests;

/// <summary>
/// Runs the real API in memory. Tests read raw JSON rather than deserialising
/// into <see cref="Patient"/>, because the contract is the wire shape: camelCase
/// names and nulls that are present rather than omitted.
/// </summary>
public abstract class ApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    protected ApiTests(WebApplicationFactory<Program> factory) => Client = factory.CreateClient();

    protected HttpClient Client { get; }

    protected async Task<JsonElement> GetJson(string path)
    {
        var response = await Client.GetAsync(path);
        response.EnsureSuccessStatusCode();
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        return document.RootElement.Clone();
    }

    protected async Task<string[]> SearchIds(string query)
    {
        var patients = await GetJson($"/api/patients?search={Uri.EscapeDataString(query)}");
        return patients.EnumerateArray().Select(patient => patient.GetProperty("id").GetString()!).ToArray();
    }
}
