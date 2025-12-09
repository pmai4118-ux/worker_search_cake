/**
 * Cloudflare Worker using Google Gemini 1.5 Flash
 * Handles search queries and generates responses using AI
 */

// Gemini API configuration
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Main worker handler
 */
export default {
  async fetch(request, env, ctx) {
    // Enable CORS
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Route handler
    const url = new URL(request.url);
    
    if (url.pathname === '/' && request.method === 'GET') {
      return new Response(getWelcomeHTML(), {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' },
      });
    }

    if (url.pathname === '/search' && request.method === 'POST') {
      return handleSearch(request, env, corsHeaders);
    }

    if (url.pathname === '/health' && request.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', model: 'gemini-1.5-flash' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Not Found', { 
      status: 404,
      headers: corsHeaders 
    });
  },
};

/**
 * Handle search requests with Gemini 1.5 Flash
 */
async function handleSearch(request, env, corsHeaders) {
  try {
    // Check for API key
    if (!env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'GEMINI_API_KEY not configured. Please set it using: wrangler secret put GEMINI_API_KEY' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const query = body.query || body.prompt;

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Missing query or prompt in request body' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Call Gemini API
    const response = await callGeminiAPI(query, env.GEMINI_API_KEY);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    // Log detailed error server-side
    console.error('Search error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Call Google Gemini 1.5 Flash API
 * Note: Google's Gemini API requires the API key as a query parameter.
 * This is the official method documented by Google.
 */
async function callGeminiAPI(prompt, apiKey) {
  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ]
  };

  const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Log detailed error server-side only
    console.error('Gemini API error:', response.status, errorText);
    // Return sanitized error message to client
    throw new Error(`Failed to generate response (status ${response.status})`);
  }

  const data = await response.json();
  
  // Extract the text from the response
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
  
  return {
    success: true,
    query: prompt,
    response: text,
    model: 'gemini-1.5-flash',
    fullResponse: data
  };
}

/**
 * Generate welcome HTML page
 */
function getWelcomeHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Worker Search Cake - Gemini 1.5 Flash</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 {
            color: #667eea;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
        }
        .search-box {
            margin: 30px 0;
        }
        textarea {
            width: 100%;
            min-height: 100px;
            padding: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 5px;
            font-size: 16px;
            font-family: inherit;
            resize: vertical;
        }
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            font-size: 16px;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 10px;
            transition: transform 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .response {
            margin-top: 30px;
            padding: 20px;
            background: #f5f5f5;
            border-radius: 5px;
            white-space: pre-wrap;
            word-wrap: break-word;
            display: none;
        }
        .response.show {
            display: block;
        }
        .error {
            background: #ffebee;
            color: #c62828;
        }
        .loading {
            text-align: center;
            color: #667eea;
        }
        .api-info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 5px;
            margin-top: 30px;
        }
        code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍰 Worker Search Cake</h1>
        <p class="subtitle">Powered by Google Gemini 1.5 Flash</p>
        
        <div class="search-box">
            <textarea id="query" placeholder="Enter your search query or question...">What is the best cake recipe?</textarea>
            <button onclick="search()">Search</button>
        </div>
        
        <div id="response" class="response"></div>
        
        <div class="api-info">
            <h3>API Usage</h3>
            <p><strong>Endpoint:</strong> <code>POST /search</code></p>
            <p><strong>Request Body:</strong></p>
            <pre><code>{
  "query": "your search query here"
}</code></pre>
            <p><strong>Example:</strong></p>
            <pre><code>curl -X POST https://your-worker.workers.dev/search \\
  -H "Content-Type: application/json" \\
  -d '{"query": "What is the best cake recipe?"}'</code></pre>
        </div>
    </div>

    <script>
        async function search() {
            const query = document.getElementById('query').value;
            const responseDiv = document.getElementById('response');
            const button = document.querySelector('button');
            
            if (!query.trim()) {
                responseDiv.className = 'response show error';
                responseDiv.textContent = 'Please enter a query';
                return;
            }
            
            button.disabled = true;
            responseDiv.className = 'response show loading';
            responseDiv.textContent = 'Searching with Gemini 1.5 Flash...';
            
            try {
                const response = await fetch('/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ query }),
                });
                
                const data = await response.json();
                
                if (data.error) {
                    responseDiv.className = 'response show error';
                    responseDiv.textContent = 'Error: ' + data.error;
                } else {
                    responseDiv.className = 'response show';
                    responseDiv.textContent = data.response;
                }
            } catch (error) {
                responseDiv.className = 'response show error';
                responseDiv.textContent = 'Error: ' + error.message;
            } finally {
                button.disabled = false;
            }
        }
        
        // Allow Enter to submit (with Shift+Enter for new line)
        document.getElementById('query').addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                search();
            }
        });
    </script>
</body>
</html>`;
}
