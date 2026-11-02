import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_FALLBACK_KEY = 'YOUR_DEFAULT_FALLBACK_KEY_HERE'; // Replace with your actual default fallback key if needed

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { endpointPath, payload, method = 'POST', customApiKey } = req.body || {};

  if (!endpointPath) {
    return res.status(400).json({ error: 'Missing endpointPath' });
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

