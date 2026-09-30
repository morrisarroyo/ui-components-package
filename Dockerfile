# One container for the hosted demo: the mock API serves the website at /,
# its own endpoints at /api and the component docs at /docs.

# Build the library, the website and the docs site.
FROM node:22-bookworm-slim AS web
WORKDIR /src
COPY package.json package-lock.json ./
COPY packages/ui/package.json packages/ui/
COPY packages/app/package.json packages/app/
RUN npm ci
COPY packages packages
RUN npm run build --workspace ui \
 && npm run build --workspace app \
 && npm run build-storybook --workspace ui -- --quiet

# Publish the API.
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api
WORKDIR /src
COPY api/Intrahealth.Api api/Intrahealth.Api
RUN dotnet publish api/Intrahealth.Api -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=api /out .
COPY --from=web /src/packages/app/dist wwwroot
COPY --from=web /src/packages/ui/storybook-static wwwroot/docs
# Hosts pass the port to listen on in PORT; 8080 when run by hand.
ENV PORT=8080
CMD ["sh", "-c", "ASPNETCORE_URLS=http://0.0.0.0:$PORT exec dotnet Intrahealth.Api.dll"]
