using System.Globalization;
using System.Text.RegularExpressions;

namespace Intrahealth.Api;

/// <summary>The body of <c>POST /api/patients</c>: a patient without an id.</summary>
/// <remarks>
/// Every member is nullable here, even the required ones, so a missing field
/// reaches <see cref="Validate"/> and gets a field error instead of failing
/// deserialisation with a bare 400.
/// </remarks>
public sealed partial record NewPatient(
    string? GivenName,
    string? FamilyName,
    string? Gender,
    string? BirthDate,
    string? Phone,
    string? Email,
    Address? Address)
{
    private static readonly string[] Genders = ["female", "male", "other", "unknown"];

    /// <summary>
    /// One message per invalid field, keyed by its JSON name; empty when the
    /// patient can be stored. The website's mapping layer applies the same rules.
    /// </summary>
    public Dictionary<string, string[]> Validate(DateOnly today)
    {
        var errors = new Dictionary<string, string[]>();

        if (string.IsNullOrWhiteSpace(GivenName))
        {
            errors["givenName"] = ["Enter a given name."];
        }

        if (string.IsNullOrWhiteSpace(FamilyName))
        {
            errors["familyName"] = ["Enter a family name."];
        }

        if (Gender is null || !Genders.Contains(Gender.Trim()))
        {
            errors["gender"] = ["Enter female, male, other or unknown."];
        }

        if (!DateOnly.TryParseExact(BirthDate?.Trim(), "yyyy-MM-dd", CultureInfo.InvariantCulture,
                DateTimeStyles.None, out var birthDate))
        {
            errors["birthDate"] = ["Enter a date as YYYY-MM-DD."];
        }
        else if (birthDate > today)
        {
            errors["birthDate"] = ["Birth date cannot be in the future."];
        }

        var email = OrNull(Email);
        if (email is not null && !EmailShape().IsMatch(email))
        {
            errors["email"] = ["Enter an email address like name@example.com."];
        }

        return errors;
    }

    /// <summary>
    /// The stored patient: values trimmed, blank optional values null. Call only
    /// once <see cref="Validate"/> has returned no errors.
    /// </summary>
    public Patient ToPatient(string id)
    {
        var address = Address is null
            ? null
            : new Address(OrNull(Address.Line), OrNull(Address.City), OrNull(Address.Region), OrNull(Address.PostalCode));
        var hasAddress = address is not null
            && (address.Line ?? address.City ?? address.Region ?? address.PostalCode) is not null;

        return new Patient(
            id,
            GivenName!.Trim(),
            FamilyName!.Trim(),
            Gender!.Trim(),
            BirthDate!.Trim(),
            OrNull(Phone),
            OrNull(Email),
            hasAddress ? address : null);
    }

    private static string? OrNull(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    // Something@something.something: a typo check, not a deliverability check.
    [GeneratedRegex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$")]
    private static partial Regex EmailShape();
}
