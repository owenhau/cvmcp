# 📄 MCP Resume Server (Cloudflare Workers + D1)

Meow! 🐾 This project is a secure, read-only **Model Context Protocol (MCP)** server hosted on Cloudflare Workers. It allows AI agents (like recruiters using Claude or other MCP-compatible tools) to query your resume data dynamically while keeping your information protected behind API key authentication.

## 🏗️ Architecture
- **Platform:** [Cloudflare Workers](https://workers.cloudflare.com/) (Serverless Edge)
- **Database:** [Cloudflare D1](https://developers.cloudflare.com/d1/) (Serverless SQL)
- **State:** [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/) (Stateful MCP Sessions)
- **Protocol:** [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) via Streamable HTTP (NDJSON)
- **Security:** 
  - **Bearer Token Auth:** Every request must include a valid API key.
  - **Session Management:** Returns `X-Session-Id` for state tracking.
  - **Expiration:** Keys automatically expire after a set period (default 90 days).
  - **Read-Only:** Worker environment cannot modify data.
  - **Local-Only Updates:** Data management via local scripts.

---

## 🛠️ Local Administrative Commands

### 1. API Key Management
```bash
# Generate Key
npm run generate-key "Recruiter Name" [days]

# List Keys
npm run list-keys

# Remove Key
npm run remove-key [id]
```

### 2. Sync Resume Data
```bash
# Sync local resume.json to D1
npm run update-resume resume.json
```

---

## 🤖 MCP Tools

| Tool Name | Description | Arguments |
|-----------|-------------|-----------|
| `get_profile` | Returns basic name, email, and summary. | None |
| `get_skills` | Returns technical skills, optionally by category. | `category` (optional) |
| `get_experience` | Returns work history, optionally by company. | `company` (optional) |
| `get_academic` | Returns educational background and degrees. | None |
| `get_projects` | Returns notable projects, optionally filtered by tech stack. | `tech_stack` (optional) |
| `analyze_fit` | Analyzes how well the resume matches a given job description. | `job_description` (required) |

---

## 🚀 Deployment Procedure

### 1. Prerequisites
- [Node.js](https://nodejs.org/) and `npm` installed.
- A Cloudflare account with a **Paid Workers Plan** (required for Durable Objects).

### 2. Initial Setup
1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd cvmcp
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Wrangler:**
    Copy the example configuration and fill in your details:
    ```bash
    cp wrangler.toml.example wrangler.toml
    ```
    - Replace `YOUR_ACCOUNT_ID` with your Cloudflare Account ID.
    - Set your `pattern` for your custom domain.

### 3. Database Initialization
1.  **Create your D1 database:**
    ```bash
    npx wrangler d1 create resume-db
    ```
    - Update the `database_id` in your `wrangler.toml` with the ID provided by Cloudflare.
2.  **Apply the schema:**
    ```bash
    npx wrangler d1 execute resume-db --file=schema.sql --remote --yes
    ```

### 4. Populate Resume Data
1.  Edit `resume.json` with your personal information.
2.  **Sync data to Cloudflare:**
    ```bash
    npm run update-resume resume.json
    ```

### 5. Final Deployment
Deploy your Worker and Durable Object namespace:
```bash
npm run deploy
```

---

## 🔌 Connection Details for Recruiters
- **Endpoint URL:** `https://cvmcp.example.com/mcp`
- **Method:** `POST`
- **Auth:** Bearer Token

### Example Request (Streaming)
```bash
curl -X POST https://cvmcp.example.com/mcp \
  -H "Authorization: Bearer resume_live_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"stream": true, "method": "tools/list", "id": 1, "jsonrpc": "2.0"}'
```

### Gemini CLI Config (`~/.gemini/settings.json`)
```json
{
  "mcpServers": {
    "my-resume": {
      "url": "https://cvmcp.example.com/mcp",
      "headers": {
        "Authorization": "Bearer resume_live_YOUR_KEY"
      },
      "trust": true
    }
  }
}
```

---

## 💡 Troubleshooting & Remarks

- **Unified Endpoint:** The previous `/sse` and `/message` endpoints have been consolidated into `/mcp`.
- **NDJSON Streaming:** When `stream: true` is sent, the server responds with newline-delimited JSON (NDJSON) chunks.
- **Verification:** To confirm the server is working, run `/mcp list` **inside** a Gemini CLI session. If it shows as `Connected` (or `Ready`) and lists your tools, the AI agent is correctly connected and ready to assist you! 🐱✨
