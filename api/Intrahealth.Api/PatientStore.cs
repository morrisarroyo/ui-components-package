namespace Intrahealth.Api;

/// <summary>
/// Every patient, starting from the seed data, held in memory for the life of
/// the process. Patients added through <c>POST /api/patients</c> are lost on
/// restart. One instance per app, so each test's app starts from the seed.
/// </summary>
public sealed class PatientStore
{
    private readonly List<Patient> _patients = [.. SeedData.Patients];
    private readonly Lock _lock = new();

    /// <summary>A snapshot of every patient, in the order they were added.</summary>
    public IReadOnlyList<Patient> All()
    {
        lock (_lock)
        {
            return [.. _patients];
        }
    }

    public Patient? Find(string id)
    {
        lock (_lock)
        {
            return _patients.FirstOrDefault(candidate => candidate.Id == id);
        }
    }

    /// <summary>Stores a new patient under the next free <c>p-NNNN</c> id.</summary>
    public Patient Add(NewPatient patient)
    {
        lock (_lock)
        {
            var next = _patients.Max(existing => int.Parse(existing.Id["p-".Length..])) + 1;
            var created = patient.ToPatient($"p-{next:D4}");
            _patients.Add(created);
            return created;
        }
    }
}
