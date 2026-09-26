// The mock API: invented patient data held in memory, no database and no
// authentication. The contract it implements is docs/API-CONTRACT.md.
var builder = WebApplication.CreateBuilder(args);

// Fixed port, matching the website's dev-server proxy (packages/app/vite.config.ts).
// Set here as well as in launchSettings.json so `dotnet run` with any profile,
// or none, still lands on it.
builder.WebHost.UseUrls("http://localhost:5080");

var app = builder.Build();

app.MapGet("/health", () => "ok");

app.Run();
