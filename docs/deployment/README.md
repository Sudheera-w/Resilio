# Deployment Guide
**Project:** Resilio — Disaster Relief Resource Management System  


---

## Overview

Resilio is deployed on Microsoft Azure using the following services:

| Service | Purpose | URL |
|---|---|---|
| Azure App Service | Hosts ASP.NET backend API | https://resilio-fuczgdd3dpe5gbe3.eastasia-01.azurewebsites.net |
| Azure SQL Database | Production relational database | resilio-sqlserver.database.windows.net |

---

## Azure Resources

| Resource | Name | Resource Group | Region |
|---|---|---|---|
| App Service | resilio | resilio-rg | East Asia |
| App Service Plan | ASP-resiliorg-955e | resilio-rg | East Asia |
| SQL Server | resilio-sqlserver | resilio-rg | — |
| SQL Database | resilio-db | resilio-rg | — |

---

## Prerequisites

To deploy or manage the Azure environment you will need:

- Access to the Azure Portal at https://portal.azure.com
- Access to the GitHub repository at https://github.com/Sudheera-w/Resilio
- Azure for Students subscription access

---

## Environment Variables

The following environment variables must be set in Azure App Service. These are configured under:

**Azure Portal → App Service (resilio) → Settings → Environment variables**

| Variable Name | Description |
|---|---|
| `ConnectionStrings__DefaultConnection` | Full Azure SQL Database connection string |

The connection string format:
```
Server=tcp:resilio-sqlserver.database.windows.net,1433;Initial Catalog=resilio-db;Persist Security Info=False;User ID=ResilioAdmin;Password=<password>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

> ⚠️ Never commit the actual connection string to GitHub. It must only exist in Azure App Service environment variables.

---

## Verification Steps

After any deployment, verify the following endpoints are responding correctly:

### 1. Health Check
```
GET https://resilio-fuczgdd3dpe5gbe3.eastasia-01.azurewebsites.net/api/health
```
Expected response:
```json
{ "status": "healthy", "app": "Resilio" }
```

### 2. Database Connection Test
```
GET https://resilio-fuczgdd3dpe5gbe3.eastasia-01.azurewebsites.net/api/test-db
```
Expected response:
```json
{ "status": "Database connected!", "server": "resilio-sqlserver.database.windows.net" }
```

### 3. Swagger UI
```
https://resilio-fuczgdd3dpe5gbe3.eastasia-01.azurewebsites.net/swagger
```
Expected: Swagger UI loads showing all API endpoints.

---

## Database Migrations

Database schema changes are managed through versioned SQL scripts located in `/database/migrations/`.

### Naming convention
```
V001__description.sql
V002__description.sql
V003__description.sql
```

### Running migrations

Connect to Azure SQL Database using Azure Data Studio or any SQL client:

| Setting | Value |
|---|---|
| Server | resilio-sqlserver.database.windows.net |
| Database | resilio-db |
| Authentication | SQL Login |
| Username | ResilioAdmin |

Run migration scripts in version order (V001 first, then V002, etc.).

> ⚠️ Never skip a version. Always run migrations in order.

---

## Rollback Procedure

If a deployment causes issues and needs to be rolled back:

### Step 1 — Identify the last working commit
```bash
git log --oneline main
```
Find the commit hash of the last known good deployment.

### Step 2 — Revert on GitHub
Go to GitHub → Repository → Commits → find the last good commit → click **Revert** to create a revert PR.

Or via command line:
```bash
git revert <commit-hash>
git push origin main
```

### Step 3 — Trigger redeployment
Once the revert is merged to `main`, the CD pipeline (configured in Sprint 2) will automatically redeploy the previous working version to Azure App Service.

### Step 4 — Verify
Run the verification steps above to confirm the rollback was successful.

---



## Local Development

For running the project locally see the main [README.md](../../README.md).

---


