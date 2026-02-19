# Brand Guardian AI

**Multimodal compliance auditing system** that analyzes YouTube videos against brand guidelines and advertising regulations using Azure AI services, LangGraph orchestration, and RAG-powered LLM analysis.

Given a YouTube URL, Brand Guardian downloads the video, extracts transcript and on-screen text via Azure Video Indexer, then evaluates compliance against FTC influencer guidelines and YouTube ad specs using GPT-4o with retrieval-augmented generation.

## Architecture

```
                         +--------------------+
                         |    React Frontend   |
                         |   (Vite + Tailwind) |
                         +---------+----------+
                                   |
                            POST /api/audit
                                   |
                         +---------v----------+
                         |  nginx reverse proxy|
                         +---------+----------+
                                   |
                         +---------v----------+
                         |   FastAPI Backend   |
                         |   (uvicorn :8000)   |
                         +---------+----------+
                                   |
                      LangGraph Workflow (DAG)
                                   |
               +-------------------+-------------------+
               |                                       |
     +---------v----------+              +-------------v-----------+
     |    Node: Indexer    |              |     Node: Auditor       |
     |--------------------|              |-------------------------|
     | 1. yt-dlp download |              | 1. Query Azure AI Search|
     | 2. Upload to Azure |   -------->  | 2. Build RAG context    |
     |    Video Indexer    |              | 3. GPT-4o analysis      |
     | 3. Extract transcript             | 4. Return violations    |
     |    + OCR text       |              +-------------------------+
     +--------------------+
               |                                       |
        Azure Video Indexer               Azure OpenAI + Azure AI Search
```
## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide icons |
| **Backend** | Python 3.12, FastAPI, uvicorn |
| **Orchestration** | LangGraph (DAG: Indexer -> Auditor -> END) |
| **LLM** | Azure OpenAI (GPT-4o) |
| **Embeddings** | Azure OpenAI (text-embedding-3-small) |
| **Knowledge Base** | Azure AI Search (vector store for RAG) |
| **Video Processing** | yt-dlp + Deno runtime, Azure Video Indexer |
| **Observability** | Azure Monitor (OpenTelemetry), LangSmith |
| **Infra** | Azure Container Apps, Azure Container Registry |
| **Package Manager** | uv (Python), npm (frontend) |

## Project Structure

```
ComplianceQAPipeline/
├── backend/
│   └── src/
│       ├── api/
│       │   ├── server.py              # FastAPI app (/audit, /health)
│       │   └── telemetry.py           # Azure Monitor setup
│       ├── graph/
│       │   ├── workflow.py            # LangGraph DAG definition
│       │   ├── nodes.py              # Indexer + Auditor logic
│       │   └── state.py              # VideoAuditState schema
│       └── services/
│           └── video_indexer.py       # Azure Video Indexer + yt-dlp
├── frontend/
│   └── src/
│       ├── components/               # AuditForm, ResultsDashboard, etc.
│       ├── hooks/useAudit.js         # Audit state management
│       └── api/auditApi.js           # Backend API client
├── nginx/
│   └── default.conf.template         # Reverse proxy config
├── backend/data/
│   ├── 1001a-influencer-guide-508_1.pdf   # FTC guidelines
│   └── youtube-ad-specs.pdf               # YouTube ad specs
├── main.py                           # CLI entry point
├── compose.yml                       # Docker Compose (local dev)
├── Dockerfile.backend                # Backend container
├── Dockerfile.frontend               # Frontend container (multi-stage)
├── pyproject.toml                    # Python dependencies
└── .github/workflows/deploy.yml      # CI/CD pipeline
```

## Prerequisites

- **Python 3.12+** with [uv](https://docs.astral.sh/uv/) package manager
- **Node.js 20+** (for frontend build)
- **Docker** (for containerized runs)
- **Azure subscription** with these services provisioned:
  - Azure OpenAI (GPT-4o + text-embedding-3-small deployments)
  - Azure AI Search (vector index for brand guidelines)
  - Azure Video Indexer
  - Azure Container Registry (for deployment)
  - Azure Container Apps (for deployment)

## Environment Variables

Create a `.env` file in the project root:

```env
# Azure OpenAI
AZURE_OPENAI_API_KEY=
AZURE_OPENAI_ENDPOINT=
AZURE_OPENAI_API_VERSION=
AZURE_OPENAI_CHAT_DEPLOYMENT=
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=

# Azure AI Search (Knowledge Base)
AZURE_SEARCH_ENDPOINT=
AZURE_SEARCH_API_KEY=
AZURE_SEARCH_INDEX_NAME=

# Azure Video Indexer
AZURE_VI_NAME=
AZURE_VI_LOCATION=
AZURE_VI_ACCOUNT_ID=
AZURE_SUBSCRIPTION_ID=
AZURE_RESOURCE_GROUP=

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=

# Observability
APPLICATIONINSIGHTS_CONNECTION_STRING=

# LangSmith Tracing (optional)
LANGCHAIN_TRACING_V2=true
LANGCHAIN_ENDPOINT=https://api.smith.langchain.com
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=brand-guardian
```

## Quick Start (Local Development)

### Option 1: Docker Compose (Recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

### Option 2: Run Services Individually

**Backend:**

```bash
uv sync
uv run uvicorn backend.src.api.server:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

### Option 3: CLI Mode

Run a one-off audit from the command line:

```bash
uv run python main.py
```

Edit the `video_url` in `main.py` to point to the YouTube video you want to audit.

## API Reference

### `POST /audit`

Submit a YouTube video for compliance analysis.

**Request:**
```json
{
  "video_url": "https://www.youtube.com/watch?v=keOaQm6RpBg"
}
```

**Response:**
```json
{
  "session_id": "ce6c43bb-c71a-4f16-a377-8b493502fee2",
  "video_id": "vid_ce6c43bb",
  "status": "FAIL",
  "final_report": "Video contains 2 critical violations...",
  "compliance_results": [
    {
      "category": "Misleading Claims",
      "severity": "CRITICAL",
      "description": "Absolute guarantee of results at timestamp 00:32"
    }
  ]
}
```

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "Brand Guardian AI"
}
```

## Deploying to Azure Container Apps

### Step 1: Azure Setup

```bash
# Login
az login

# Create resource group
az group create --name brand-guardian-rg --location eastus

# Create container registry
az acr create --resource-group brand-guardian-rg \
  --name brandguardianacr --sku Basic --admin-enabled true
az acr login --name brandguardianacr

# Create container apps environment
az containerapp env create \
  --name brandguardian-env \
  --resource-group brand-guardian-rg \
  --location eastus
```

### Step 2: Build and Push Images

```bash
# Get ACR credentials
ACR_PASSWORD=$(az acr credential show --name brandguardianacr --query "passwords[0].value" -o tsv)

# Build and push backend
docker build -f Dockerfile.backend -t brandguardianacr.azurecr.io/brandguardian-backend:v1 .
docker push brandguardianacr.azurecr.io/brandguardian-backend:v1

# Build and push frontend
docker build -f Dockerfile.frontend -t brandguardianacr.azurecr.io/brandguardian-frontend:v1 .
docker push brandguardianacr.azurecr.io/brandguardian-frontend:v1
```

### Step 3: Deploy Backend

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

> Replace each `<value>` with your actual configuration.

### Step 4: Enable Managed Identity

Required for Azure Video Indexer token generation:

```bash
az containerapp identity assign \
  --name brandguardian-backend \
  --resource-group brand-guardian-rg \
  --system-assigned
```

Grant the identity access to Video Indexer:

```bash
PRINCIPAL_ID=$(az containerapp show --name brandguardian-backend \
  --resource-group brand-guardian-rg \
  --query "identity.principalId" -o tsv)

az role assignment create \
  --assignee $PRINCIPAL_ID \
  --role "Contributor" \
  --scope "/subscriptions/<sub-id>/resourceGroups/brand-guardian-rg/providers/Microsoft.VideoIndexer/accounts/<vi-name>"
```

### Step 5: Deploy Frontend

```bash
BACKEND_FQDN=$(az containerapp show \
  --name brandguardian-backend \
  --resource-group brand-guardian-rg \
  --query "properties.configuration.ingress.fqdn" -o tsv)

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

### Step 6: Configure CORS

```bash
FRONTEND_FQDN=$(az containerapp show \
  --name brandguardian-frontend \
  --resource-group brand-guardian-rg \
  --query "properties.configuration.ingress.fqdn" -o tsv)

az containerapp update \
  --name brandguardian-backend \
  --resource-group brand-guardian-rg \
  --set-env-vars CORS_ORIGINS="https://$FRONTEND_FQDN,http://localhost:5173,http://localhost:3000"
```

### Step 7: Verify

```bash
curl https://$BACKEND_FQDN/health
curl https://$FRONTEND_FQDN/api/health
echo "Open https://$FRONTEND_FQDN in your browser"
```

## CI/CD with GitHub Actions

The workflow at `.github/workflows/deploy.yml` auto-deploys on every push to `main`.

### One-Time Setup

1. **Create a service principal:**
   ```bash
   az ad sp create-for-rbac \
     --name "brand-guardian-github" \
     --role contributor \
     --scopes /subscriptions/<sub-id>/resourceGroups/brand-guardian-rg \
     --json-auth
   ```

2. **Grant ACR push permission:**
   ```bash
   SP_APPID=$(az ad sp list --display-name "brand-guardian-github" --query "[0].appId" -o tsv)
   az role assignment create \
     --assignee $SP_APPID \
     --role AcrPush \
     --scope /subscriptions/<sub-id>/resourceGroups/brand-guardian-rg
   ```

3. **Add GitHub secrets** (Settings > Secrets and variables > Actions):

   | Secret | Value |
   |--------|-------|
   | `AZURE_CREDENTIALS` | Full JSON output from step 1 |
   | `COOKIES_TXT` | Contents of your `cookies.txt` (for YouTube auth) |

### Pipeline Flow

Every push to `main`:

1. Checks out code
2. Logs into Azure and ACR
3. Writes `cookies.txt` from secret
4. Builds and pushes backend + frontend Docker images (tagged with commit SHA)
5. Updates both Azure Container Apps with new images
6. Prints deployment URLs in the GitHub Actions summary

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|---------|
| `504 Gateway Timeout` on frontend | Video audit exceeds default 240s timeout | Azure Container Apps default Envoy timeout is 240s; keep videos under ~30s or implement async polling |
| `n challenge solving failed` | Missing JS runtime for yt-dlp | Ensure Deno is installed in Docker image + `yt-dlp-ejs` in dependencies |
| `Requested format is not available` | yt-dlp can't decrypt video URLs | Same as above: install Deno + yt-dlp-ejs |
| `AuthorizationFailed` on Video Indexer | Missing RBAC role | Grant managed identity Contributor role on the Video Indexer resource |
| Cold start delays (30-60s) | `min-replicas 0` scales to zero | Set `--min-replicas 1` for always-on (increases cost) |
| `cookies.txt not found` warning | Cookie file missing from container | Ensure `cookies.txt` exists in build context or is written from GitHub secret |

## License

Private repository. All rights reserved.
