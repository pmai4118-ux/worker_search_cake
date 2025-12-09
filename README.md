# Worker Search Cake 🍰

A Cloudflare Worker powered by Google Gemini 1.5 Flash for AI-driven search and question answering capabilities.

## Features

- 🤖 Integration with Google Gemini 1.5 Flash AI model
- 🔍 Search and question-answering capabilities
- 🌐 RESTful API with CORS support
- 🎨 Interactive web interface
- ⚡ Fast and serverless deployment on Cloudflare Workers

## Prerequisites

- Node.js (v16 or higher)
- A Cloudflare account
- A Google Cloud account with Gemini API access
- Wrangler CLI (will be installed via npm)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 3. Configure API Key

Add your Gemini API key as a secret:

```bash
npx wrangler secret put GEMINI_API_KEY
```

When prompted, paste your API key.

## Development

Run the worker locally:

```bash
npm run dev
```

This will start a local server at `http://localhost:8787`

## Deployment

Deploy to Cloudflare Workers:

```bash
npm run deploy
```

## API Usage

### Web Interface

Navigate to your worker URL in a browser to access the interactive search interface.

### POST /search

Send search queries to the Gemini 1.5 Flash model.

**Request:**

```bash
curl -X POST https://your-worker.workers.dev/search \
  -H "Content-Type: application/json" \
  -d '{"query": "What is the best cake recipe?"}'
```

**Request Body:**

```json
{
  "query": "your search query or question"
}
```

**Response:**

```json
{
  "success": true,
  "query": "What is the best cake recipe?",
  "response": "Here's a classic vanilla cake recipe...",
  "model": "gemini-1.5-flash",
  "fullResponse": { ... }
}
```

### GET /health

Check worker health status.

**Request:**

```bash
curl https://your-worker.workers.dev/health
```

**Response:**

```json
{
  "status": "ok",
  "model": "gemini-1.5-flash"
}
```

## Configuration

Edit `wrangler.toml` to customize:

- Worker name
- Compatibility date
- Environment variables

## Architecture

- **Runtime:** Cloudflare Workers (V8 isolates)
- **Language:** JavaScript (ES modules)
- **AI Model:** Google Gemini 1.5 Flash
- **API:** RESTful with JSON

## Security

- API key stored as Cloudflare secret (not in code)
- CORS enabled for cross-origin requests
- Content safety filters enabled in Gemini API
- Input validation on all endpoints

## Cost Considerations

- Cloudflare Workers: Free tier includes 100,000 requests/day
- Gemini API: Check [Google's pricing](https://ai.google.dev/pricing) for current rates

## Troubleshooting

### "GEMINI_API_KEY not configured" error

Make sure you've set the API key secret:

```bash
npx wrangler secret put GEMINI_API_KEY
```

### Local development issues

Ensure you're using the latest version of Wrangler:

```bash
npm install wrangler@latest
```

## License

MIT