namespace Intrahealth.Api;

/// <summary>
/// Invented patients, held in memory for the life of the process. Every name,
/// number and address here is made up.
/// </summary>
/// <remarks>
/// Several records are deliberately incomplete so the website's missing-value
/// path (rendered as an em dash) can be exercised against the real API:
/// p-0003 has no email, p-0005 has no address, p-0007 has no phone, p-0009 has
/// a partial address, and p-0011 has an address whose parts are all null.
/// </remarks>
public static class SeedData
{
    public static IReadOnlyList<Patient> Patients { get; } =
    [
        new("p-0001", "Amara", "Okonkwo", "female", "1984-03-02",
            "+1 416 555 0133", "amara.okonkwo@example.com",
            new("412 Wellesley St E", "Toronto", "ON", "M4X 1H2")),
        new("p-0002", "Daniel", "Tremblay", "male", "1971-11-19",
            "+1 514 555 0172", "daniel.tremblay@example.com",
            new("88 Rue Saint-Denis", "Montréal", "QC", "H2X 3K8")),
        new("p-0003", "Priya", "Raman", "female", "1992-07-08",
            "+1 604 555 0118", null,
            new("1550 W 8th Ave", "Vancouver", "BC", "V6J 1T5")),
        new("p-0004", "Liam", "O'Connor", "male", "2001-01-27",
            "+1 902 555 0147", "liam.oconnor@example.com",
            new("27 Spring Garden Rd", "Halifax", "NS", "B3J 3R4")),
        new("p-0005", "Mei", "Chen", "female", "1958-09-30",
            "+1 403 555 0164", "mei.chen@example.com",
            null),
        new("p-0006", "Jordan", "Blackbird", "other", "1996-04-14",
            "+1 306 555 0109", "jordan.blackbird@example.com",
            new("310 Broadway Ave", "Saskatoon", "SK", "S7N 1B6")),
        new("p-0007", "Samuel", "Okafor", "male", "1989-12-03",
            null, "samuel.okafor@example.com",
            new("45 King St W", "Kitchener", "ON", "N2G 1A1")),
        new("p-0008", "Élise", "Gagnon", "female", "1966-06-21",
            "+1 418 555 0126", "elise.gagnon@example.com",
            new("9 Rue du Trésor", "Québec", "QC", "G1R 4L4")),
        new("p-0009", "Omar", "Haddad", "male", "1979-02-11",
            "+1 613 555 0190", "omar.haddad@example.com",
            new(null, "Ottawa", "ON", null)),
        new("p-0010", "Grace", "Anderson", "female", "2010-10-05",
            "+1 204 555 0155", "grace.anderson@example.com",
            new("200 Portage Ave", "Winnipeg", "MB", "R3C 3X1")),
        new("p-0011", "Alex", "Morgan", "unknown", "1975-08-17",
            "+1 709 555 0138", "alex.morgan@example.com",
            new(null, null, null, null)),
        new("p-0012", "Noah", "Singh", "male", "1999-05-29",
            "+1 780 555 0181", "noah.singh@example.com",
            new("10220 104 Ave NW", "Edmonton", "AB", "T5J 0H6")),
    ];
}
