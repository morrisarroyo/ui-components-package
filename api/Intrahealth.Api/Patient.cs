namespace Intrahealth.Api;

// The wire shape in docs/API-CONTRACT.md. Property names serialise as
// camelCase, and nullable members serialise as JSON null rather than being
// omitted, so the client can tell "absent" from "the server forgot".

/// <summary>A patient, as returned by both patient endpoints.</summary>
/// <param name="Gender">One of <c>female</c>, <c>male</c>, <c>other</c>, <c>unknown</c>.</param>
/// <param name="BirthDate">ISO 8601 date only, <c>YYYY-MM-DD</c>.</param>
public sealed record Patient(
    string Id,
    string GivenName,
    string FamilyName,
    string Gender,
    string BirthDate,
    string? Phone,
    string? Email,
    Address? Address);

/// <summary>A postal address. Every part is independently nullable.</summary>
public sealed record Address(
    string? Line,
    string? City,
    string? Region,
    string? PostalCode);
