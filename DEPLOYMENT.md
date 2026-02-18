# Brand Guardian AI — Azure Deployment Guide

## Architecture

```
    Internet
       │
  ┌────▼─────────────────────┐
  │  Frontend Container       │  ← Public URL (users visit this)
  │  nginx: React + /api proxy│
  └────┬─────────────────────┘
       │ /api/* proxied
  ┌────▼─────────────────────┐
  │  Backend Container        │  ← FastAPI + uvicorn on port 8000
  │  Python 3.12 + uv         │
  └────┬─────────────────────┘
       │
  Azure AI Search, Azure OpenAI, Azure Video Indexer
```

Both containers run in the same **Azure Container Apps Environment**.

## Prerequisites

- Azure CLI installed (`curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash`)
- Docker installed
- Azure subscription with these providers registered:
  ```bash
  az provider register --namespace Microsoft.ContainerRegistry
  az provider register --namespace Microsoft.App
  ```

---

## Step 1: Login to Azure

```bash
az login
az account set --subscription "88afe548-4543-4daa-ba26-64491c4517f9"
```

## Step 2: Create Resource Group

```bash
az group create --name brand-guardian-rg --location eastus
```

## Step 3: Create Azure Container Registry (ACR)

```bash
az acr create --resource-group brand-guardian-rg --name brandguardianacr --sku Basic --admin-enabled true
az acr login --name brandguardianacr
```

## Step 4: Build & Push Docker Images

Run from the `ComplianceQAPipeline/` directory:

```bash
# Backend
docker build -f Dockerfile.backend -t brandguardianacr.azurecr.io/brandguardian-backend:v1 .
docker push brandguardianacr.azurecr.io/brandguardian-backend:v1

# Frontend
docker build -f Dockerfile.frontend -t brandguardianacr.azurecr.io/brandguardian-frontend:v1 .
docker push brandguardianacr.azurecr.io/brandguardian-frontend:v1
```

## Step 5: Create Container Apps Environment

```bash
az containerapp env create --name brandguardian-env --resource-group brand-guardian-rg --location eastus
```

## Step 6: Get ACR Credentials

```bash
ACR_PASSWORD=$(az acr credential show --name brandguardianacr --query "passwords[0].value" -o tsv)
```

## Step 7: Deploy Backend Container

```bash
az containerapp create \
  --name brandguardian-backend \
  --resource-group brand-guardian-rg \
  --environment brandguardian-env \
  --image brandguardianacr.azurecr.io/brandguardian-backend:v1 \
  --registry-server brandguardianacr.azurecr.io \
  --registry-username brandguardianacr \
  --registry-password "$ACR_PASSWORD" \
  --target-port 8000 \
  --ingress external \
  --min-replicas 0 --max-replicas 1 \
  --cpu 1.0 --memory 2.0Gi \
  --env-vars \
    AZURE_STORAGE_CONNECTION_STRING="<value>" \
    AZURE_OPENAI_API_KEY="<value>" \
    AZURE_OPENAI_ENDPOINT="<value>" \
    AZURE_OPENAI_API_VERSION="<value>" \
    AZURE_OPENAI_CHAT_DEPLOYMENT="<value>" \
    AZURE_OPENAI_EMBEDDING_DEPLOYMENT="<value>" \
    AZURE_SEARCH_ENDPOINT="<value>" \
    AZURE_SEARCH_API_KEY="<value>" \
    AZURE_SEARCH_INDEX_NAME="<value>" \
    AZURE_VI_NAME="<value>" \
    AZURE_VI_LOCATION="<value>" \
    AZURE_VI_ACCOUNT_ID="<value>" \
    AZURE_SUBSCRIPTION_ID="<value>" \
    AZURE_RESOURCE_GROUP="<value>" \
    APPLICATIONINSIGHTS_CONNECTION_STRING="<value>" \
    LANGCHAIN_TRACING_V2="true" \
    LANGCHAIN_ENDPOINT="https://api.smith.langchain.com" \
    LANGCHAIN_API_KEY="<value>" \
    LANGCHAIN_PROJECT="brand-guardian-prod"
```

> Replace each `<value>` with the actual value from your `.env` file.

## Step 8: Increase Backend Request Timeout

**CRITICAL** — default is 240s but the `/audit` endpoint takes 2-5 minutes:

```bash
az containerapp ingress update \
  --name brandguardian-backend \
  --resource-group brand-guardian-rg \
  --request-timeout 600
```

## Step 9: Get Backend URL & Deploy Frontend

```bash
BACKEND_FQDN=$(az containerapp show \
  --name brandguardian-backend \
  --resource-group brand-guardian-rg \
  --query "properties.configuration.ingress.fqdn" -o tsv)
echo "Backend: https://$BACKEND_FQDN"

az containerapp create \
  --name brandguardian-frontend \
  --resource-group brand-guardian-rg \
  --environment brandguardian-env \
  --image brandguardianacr.azurecr.io/brandguardian-frontend:v1 \
  --registry-server brandguardianacr.azurecr.io \
  --registry-username brandguardianacr \
  --registry-password "$ACR_PASSWORD" \
  --target-port 80 \
  --ingress external \
  --min-replicas 0 --max-replicas 1 \
  --cpu 0.25 --memory 0.5Gi \
  --env-vars BACKEND_URL="https://$BACKEND_FQDN"
```

## Step 10: Get Public URL & Update CORS

```bash
FRONTEND_FQDN=$(az containerapp show \
  --name brandguardian-frontend \
  --resource-group brand-guardian-rg \
  --query "properties.configuration.ingress.fqdn" -o tsv)
echo "Public URL: https://$FRONTEND_FQDN"

az containerapp update \
  --name brandguardian-backend \
  --resource-group brand-guardian-rg \
  --set-env-vars CORS_ORIGINS="https://$FRONTEND_FQDN,http://localhost:5173,http://localhost:3000"
```

## Step 11: Enable Managed Identity

Required for Azure Video Indexer authentication:

```bash
az containerapp identity assign \
  --name brandguardian-backend \
  --resource-group brand-guardian-rg \
  --system-assigned
```

## Step 12: Verify Deployment

```bash
curl https://$BACKEND_FQDN/health        # Backend directly
curl https://$FRONTEND_FQDN/api/health   # Backend via nginx proxy
```

Visit `https://$FRONTEND_FQDN` in your browser.

---

## CI/CD with GitHub Actions

The workflow at `.github/workflows/deploy.yml` auto-deploys on every push to `main`.

### One-Time Setup

1. Create a service principal:
   ```bash
   az ad sp create-for-rbac \
     --name "brand-guardian-github" \
     --role contributor \
     --scopes /subscriptions/88afe548-4543-4daa-ba26-64491c4517f9/resourceGroups/brand-guardian-rg \
     --json-auth
   ```

2. Grant ACR push permission:
   ```bash
   SP_APPID=$(az ad sp list --display-name "brand-guardian-github" --query "[0].appId" -o tsv)
   az role assignment create \
     --assignee $SP_APPID \
     --role AcrPush \
     --scope /subscriptions/88afe548-4543-4daa-ba26-64491c4517f9/resourceGroups/brand-guardian-rg
   ```

3. Add the JSON output from step 1 as a GitHub secret:
   - Go to **repo Settings** → **Secrets and variables** → **Actions**
   - Create secret named `AZURE_CREDENTIALS`
   - Paste the entire JSON blob

### How It Works

Every push to `main`:
1. Builds backend + frontend Docker images (tagged with commit SHA)
2. Pushes to Azure Container Registry
3. Updates both Container Apps with new images
4. Prints deployment URLs in the Actions summary

---

## Local Development with Docker

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API via proxy: http://localhost:3000/api/health

---

## Critical Gotchas

| Issue | Solution |
|-------|----------|
| Audit requests killed at 240s | Run `az containerapp ingress update --request-timeout 600` (Step 8) |
| Cold starts (30-60s) with `min-replicas 0` | Set `--min-replicas 1` for always-on (higher cost) |
| `BACKEND_URL` must include `https://` | Full URL like `https://brandguardian-backend.xxx.azurecontainerapps.io` |
| All 3 timeout layers must align | nginx: 600s, uvicorn: 620s, Azure ingress: 600s |
| `.env` not in container (by design) | Env vars passed via `--env-vars` at deploy time |
