using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Intrahealth.Api.Tests;

public class PatientListTests(WebApplicationFactory<Program> factory) : ApiTests(factory)
{
    [Fact]
    public async Task Returns_every_seed_patient_without_a_search()
    {
        var patients = await GetJson("/api/patients");

        Assert.Equal(JsonValueKind.Array, patients.ValueKind);
        Assert.Equal(12, patients.GetArrayLength());
    }

    [Fact]
    public async Task Serialises_every_contract_field_in_camelCase()
    {
        var first = (await GetJson("/api/patients"))[0];

        var names = first.EnumerateObject().Select(property => property.Name).ToArray();
        Assert.Equal(
            ["id", "givenName", "familyName", "gender", "birthDate", "phone", "email", "address"],
            names);
        Assert.Equal(
            ["line", "city", "region", "postalCode"],
            first.GetProperty("address").EnumerateObject().Select(property => property.Name).ToArray());
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Treats_an_empty_or_blank_search_as_no_filter(string search)
    {
        Assert.Equal(12, (await SearchIds(search)).Length);
    }

    [Theory]
    [InlineData("oko", "p-0001")]
    [InlineData("OKONKWO", "p-0001")]
    [InlineData("amara oko", "p-0001")]
    [InlineData("  amara  ", "p-0001")]
    [InlineData("sam", "p-0007")]
    [InlineData("élise", "p-0008")]
    public async Task Matches_given_family_or_joined_name_ignoring_case_and_padding(string search, string expectedId)
    {
        Assert.Equal([expectedId], await SearchIds(search));
    }

    [Fact]
    public async Task Returns_every_patient_that_matches()
    {
        // "an" is inside Daniel, Raman, Jordan, Anderson and Morgan, and no other name.
        Assert.Equal(["p-0002", "p-0003", "p-0006", "p-0010", "p-0011"], await SearchIds("an"));
    }

    [Fact]
    public async Task Does_not_match_across_the_family_then_given_order()
    {
        Assert.Empty(await SearchIds("okonkwo amara"));
    }

    [Fact]
    public async Task Answers_no_match_with_200_and_an_empty_array()
    {
        var response = await Client.GetAsync("/api/patients?search=zzz");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("[]", await response.Content.ReadAsStringAsync());
    }
}
