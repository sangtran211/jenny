import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_FALLBACK_KEY = 'YOUR_DEFAULT_FALLBACK_KEY_HERE'; // Replace with your actual default fallback key if needed

const AI_STUDIO_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';
// Only content generation on a model id is relayed, so the shared key cannot be used for anything else.
const AI_STUDIO_ALLOWED_PATH = /^models\/[A-Za-z0-9._-]+:generateContent$/;

async function handleAiStudio(
  endpointPath: unknown,
  payload: unknown,
  method: unknown,
  res: VercelResponse
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing GEMINI_API_KEY' });
  }
  const isList = method === 'GET' && endpointPath === 'models';
  if (!isList && (typeof endpointPath !== 'string' || !AI_STUDIO_ALLOWED_PATH.test(endpointPath))) {
    return res.status(400).json({ error: 'endpointPath not allowed' });
  }

  try {
    const response = isList
      ? await fetch(`${AI_STUDIO_BASE_URL}/models?pageSize=1000`, {
          headers: { 'x-goog-api-key': apiKey },
        })
      : await fetch(`${AI_STUDIO_BASE_URL}/${endpointPath}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify(payload ?? {}),
        });
    const rawText = await response.text();
    if (!response.ok) {
      let message = `Google API Error (${response.status}): ${response.statusText}`;
      try {
        message = JSON.parse(rawText)?.error?.message || message;
      } catch {
        // keep the generic message
      }
      return res.status(response.status).json({ error: message });
    }
    return res.status(200).json(JSON.parse(rawText));
  } catch (error: any) {
    console.error('AI Studio proxy error:', error);
    return res.status(500).json({ error: error?.message || 'Internal Server Error' });
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { endpointPath, payload, method = 'POST', customApiKey, provider } = req.body || {};

  if (!endpointPath) {
    return res.status(400).json({ error: 'Missing endpointPath' });
  }

  if (provider === 'aistudio') {
    return handleAiStudio(endpointPath, payload, method, res);
  }

  const apiKey =
    customApiKey ||
    process.env.JENNY_API_KEY ||
    process.env.VITE_JENNY_API_KEY ||
    DEFAULT_FALLBACK_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing JENNY_API_KEY' });
  }

  const isUsCentral = endpointPath.includes('locations/us-central1');
  const baseUrl = isUsCentral
    ? 'https://us-central1-aiplatform.googleapis.com/v1'
    : 'https://aiplatform.googleapis.com/v1';

  const separator = endpointPath.includes('?') ? '&' : '?';
  const url = `${baseUrl}/${endpointPath}${separator}key=${apiKey}`;

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (method !== 'GET' && payload) {
      fetchOptions.body = JSON.stringify(payload);
    }

    const response = await fetch(url, fetchOptions);
    const rawText = await response.text();

    if (!response.ok) {
      let parsedError: any = null;
      try {
        parsedError = JSON.parse(rawText);
      } catch {
        // ignore JSON parse error
      }
      const errMsg =
        parsedError?.error?.message ||
        `Google API Error (${response.status}): ${response.statusText}`;
      return res.status(response.status).json({
        error: errMsg,
        details: rawText,
      });
    }

    try {
      const data = JSON.parse(rawText);
      return res.status(200).json(data);
    } catch {
      return res.status(200).send(rawText);
    }
  } catch (error: any) {
    console.error('Proxy Error:', error);
    return res.status(500).json({
      error: error?.message || 'Internal Server Error',
    });
  }
}

