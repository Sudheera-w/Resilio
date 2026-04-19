# Resilio CI/CD — GitHub Secrets & Environment Setup Guide

This document tells you exactly what to configure in GitHub before the workflows will run correctly.

---

## 1. Create GitHub Environments

Go to: **GitHub → Your Repo → Settings → Environments**

Create two environments:

| Environment | Protection Rule |
|---|---|
| `staging` | None (auto-deploy from `develop`) |
| `production` | ✅ **Required reviewers** — add yourself + teammates |

> Setting "Required reviewers" on `production` is the manual approval gate.  
> The pipeline pauses at every job tagged `environment: production` until an approver clicks **Approve and deploy** in GitHub.

---

## 2. Required GitHub Secrets

Add these in **Settings → Environments → [environment name] → Environment secrets**.

### `staging` environment secrets

| Secret Name | What It Contains |
|---|---|
| `AZURE_WEBAPP_PUBLISH_PROFILE_STAGING` | XML publish profile downloaded from `resilio-api-staging` App Service |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING` | Deployment token from Azure Static Web Apps (staging) |
| `STAGING_SQL_CONNECTION_STRING` | Full Azure SQL connection string for the staging database |
| `VITE_API_BASE_URL_STAGING` | `https://resilio-api-staging.azurewebsites.net` |
| `STAGING_FRONTEND_URL` | Full URL of your staging Static Web App |

### `production` environment secrets

| Secret Name | What It Contains |
|---|---|
| `AZURE_WEBAPP_PUBLISH_PROFILE_PROD_SLOT` | Publish profile for the **staging slot** of `resilio-api-prod` |
| `AZURE_STATIC_WEB_APPS_API_TOKEN_PROD` | Deployment token from Azure Static Web Apps (production) |
| `PROD_SQL_CONNECTION_STRING` | Full Azure SQL connection string for the production database |
| `VITE_API_BASE_URL_PROD` | `https://resilio-api-prod.azurewebsites.net` |
| `PROD_FRONTEND_URL` | Full URL of your production Static Web App |
| `AZURE_CREDENTIALS` | Service principal JSON (needed for slot swap via Azure CLI) |

---

## 3. How to get each secret value

### Publish Profile (XML)
1. Azure Portal → App Service → `resilio-api-staging`
2. Click **Get publish profile** → downloads an `.xml` file
3. Open the file, copy **all the text**
4. Paste as the secret value

### Static Web Apps API Token
1. Azure Portal → Static Web Apps → your app
2. **Manage deployment token** → copy
3. Paste as the secret value

### Azure Credentials (Service Principal)
Run this in Azure CLI (replace `<subscription-id>`):
```bash
az ad sp create-for-rbac \
  --name "resilio-github-actions" \
  --role contributor \
  --scopes /subscriptions/<subscription-id>/resourceGroups/resilio-rg \
  --sdk-auth
```
Copy the entire JSON output as the `AZURE_CREDENTIALS` secret.

---

## 4. Azure resources to create

| Resource | Name | Purpose |
|---|---|---|
| App Service | `resilio-api-staging` | Staging backend |
| App Service | `resilio-api-prod` | Production backend |
| Deployment Slot | `resilio-api-prod/staging` | Pre-swap slot on prod App Service |
| Static Web App | `resilio-web-staging` | Staging frontend |
| Static Web App | `resilio-web-prod` | Production frontend |
| Azure SQL | `resilio-db-staging` | Staging database |
| Azure SQL | `resilio-db-prod` | Production database |
| Resource Group | `resilio-rg` | Containers all of the above |

---

## 5. appsettings — AllowedOrigins for CORS

In `appsettings.Staging.json` and `appsettings.Production.json`, add:

```json
"AllowedOrigins": [
  "https://your-staging-static-web-app.azurestaticapps.net"
]
```

This allows the Azure-hosted frontend to call the Azure-hosted backend without CORS errors.

---

## 6. Branch setup

```bash
# From main
git checkout -b develop
git push origin develop
```

Set `develop` as the **default branch** in GitHub → Settings → General → Default branch.

---

## 7. Workflow trigger summary

| Workflow | Triggered by | What it does |
|---|---|---|
| `ci.yml` | PR to `develop` or `main`; push to `develop` | Lint, build, test, validate migrations |
| `deploy-staging.yml` | Push to `develop` | Full staging deployment + smoke tests |
| `deploy-production.yml` | Push to `main` or manual dispatch | Production deployment with approval gate |
