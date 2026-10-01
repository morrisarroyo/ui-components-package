using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Intrahealth.Api.Tests;

public class SwaggerTests(WebApplicationFactory<Program> factory) : ApiTests(factory)
{
    [Fact]
    public async Task Describes_both_patient_endpoints_and_the_404()
    {
        var document = await GetJson("/api/swagger/v1/swagger.json");
        var paths = document.GetProperty("paths");

        Assert.True(paths.TryGetProperty("/api/patients", out var list));
        Assert.Equal("search", list.GetProperty("get").GetProperty("parameters")[0].GetProperty("name").GetString());
        Assert.True(paths.TryGetProperty("/api/patients/{id}", out var byId));
        Assert.True(byId.GetProperty("get").GetProperty("responses").TryGetProperty("404", out _));
        Assert.False(paths.TryGetProperty("/health", out _));
    }

    [Fact]
    public async Task Serves_the_swagger_page()
    {
        var response = await Client.GetAsync("/api/swagger/index.html");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("swagger-ui", await response.Content.ReadAsStringAsync());
    }
}
