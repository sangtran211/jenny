import { AppSettings, Message } from '../types/chat';
import type { RawAiStudioModel } from './modelCatalog';

interface ApiContext {
  settings: AppSettings;
}

const DEFAULT_FALLBACK_KEY = 'YOUR_DEFAULT_FALLBACK_KEY_HERE'; // Replace with your actual default fallback key if needed

const AI_STUDIO_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

const isAiStudio = (settings: AppSettings) => (settings.provider ?? 'aistudio') === 'aistudio';

const isLocalhost = () =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const getAiStudioKey = (settings: AppSettings) =>
  settings.aiStudioApiKey?.trim() || import.meta.env.VITE_GEMINI_API_KEY || '';

const getModelPath = (model: string, settings: AppSettings) =>
  isAiStudio(settings) ? `models/${model}` : `publishers/google/models/${model}`;

const requireAiStudioKey = (settings: AppSettings) => {
  const key = getAiStudioKey(settings);
  if (!key) {
    throw new Error('Chưa có AI Studio API Key. Nhập key trong Cấu hình hoặc đặt VITE_GEMINI_API_KEY trong .env.local.');
  }
  return key;
};

const throwApiError = async (res: Response): Promise<never> => {
  const errText = await res.text();
  let errMsg = res.statusText;
  try {
    const errJson = JSON.parse(errText);
    errMsg = errJson.error?.message || errMsg;
  } catch {
    errMsg = errText || errMsg;
  }
  throw new Error(`API Error (${res.status}): ${errMsg}`);
};

const getProxyOrDirectBaseUrl = (settings: AppSettings, isUsCentral: boolean) => {
  const customKey =
    settings.customApiKey?.trim() ||
    import.meta.env.VITE_JENNY_API_KEY ||
    DEFAULT_FALLBACK_KEY;

  if (isLocalhost() && customKey) {
    return {
      baseUrl: isUsCentral
        ? 'https://us-central1-aiplatform.googleapis.com/v1'
        : 'https://aiplatform.googleapis.com/v1',
      key: customKey,
      useProxy: false,
    };
  }

  return {
    baseUrl: '/api/jenny',
    key: customKey,
    useProxy: true,
    directFallbackUrl: isUsCentral
      ? 'https://us-central1-aiplatform.googleapis.com/v1'
      : 'https://aiplatform.googleapis.com/v1',
  };
};

// Lists the models the AI Studio key can use. Same key/proxy routing as generation requests.
export const listAiStudioModels = async (settings: AppSettings): Promise<RawAiStudioModel[]> => {
  let res: Response;
  if (!getAiStudioKey(settings) && !isLocalhost()) {
    res = await fetch('/api/jenny', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider: 'aistudio', endpointPath: 'models', method: 'GET' }),
    });
  } else {
    res = await fetch(`${AI_STUDIO_BASE_URL}/models?pageSize=1000`, {
      headers: { 'x-goog-api-key': requireAiStudioKey(settings) },
    });
  }
  if (!res.ok) await throwApiError(res);
  const data = await res.json();
  return Array.isArray(data.models) ? data.models : [];
};

const parseDataUri = (dataUri: string) => {
  const matches = dataUri.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (matches) {
    return { mimeType: matches[1], data: matches[2] };
  }
  return { mimeType: 'image/png', data: dataUri };
};

const executeRequest = async (
  endpointPath: string,
  payload: any,
  context: ApiContext,
  isUsCentral = false
) => {
  if (isAiStudio(context.settings)) {
    // A key in the browser (typed in Settings or VITE_GEMINI_API_KEY) goes direct to Google.
    // With no client key on a deployed site, the server-side proxy supplies GEMINI_API_KEY instead.
    if (!getAiStudioKey(context.settings) && !isLocalhost()) {
      const res = await fetch('/api/jenny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'aistudio', endpointPath, payload }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `API Error (Status ${res.status})`);
      }
      return res.json();
    }

    const res = await fetch(`${AI_STUDIO_BASE_URL}/${endpointPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': requireAiStudioKey(context.settings),
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) await throwApiError(res);
    return res.json();
  }

  const { baseUrl, key, useProxy, directFallbackUrl } = getProxyOrDirectBaseUrl(
    context.settings,
    isUsCentral
  );

  if (useProxy) {
    try {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointPath,
          payload,
          method: 'POST',
          customApiKey: context.settings.customApiKey?.trim() || undefined,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
      if (res.status !== 404) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `API Error (Status ${res.status})`);
      }
    } catch (proxyErr: any) {
      if (!key || !directFallbackUrl) throw proxyErr;
    }
  }

  const targetBase = directFallbackUrl || baseUrl;
  const separator = endpointPath.includes('?') ? '&' : '?';
  const url = `${targetBase}/${endpointPath}${separator}key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) await throwApiError(res);
  return res.json();
};


const buildChatContents = (prompt: string, history: Message[], imageDataUri?: string | null) => {
  const contents = history
    .filter((msg) => msg.text?.trim() || (msg.attachments && msg.attachments.length > 0))
    .map((msg) => {
      const parts: any[] = [];
      if (msg.text?.trim()) {
        parts.push({ text: msg.text });
      }
      msg.attachments?.forEach((att) => {
        if (att.type === 'image' && att.url) {
          const { mimeType, data } = parseDataUri(att.url);
          parts.push({ inlineData: { mimeType, data } });
        }
      });
      return {
        role: msg.role === 'user' ? 'user' : 'model',
        parts: parts.length > 0 ? parts : [{ text: '...' }],
      };
    });

  const userParts: any[] = [];
  if (prompt.trim()) {
    userParts.push({ text: prompt });
  }
  if (imageDataUri) {
    const { mimeType, data } = parseDataUri(imageDataUri);
    userParts.push({ inlineData: { mimeType, data } });
  }

  contents.push({
    role: 'user',
    parts: userParts.length > 0 ? userParts : [{ text: 'Hello' }],
  });

  return contents;
};

export const generateText = async (
  prompt: string,
  model: string,
  context: ApiContext,
  history: Message[] = [],
  imageDataUri?: string | null,
  onStreamChunk?: (fullTextSoFar: string) => void
) => {
  const contents = buildChatContents(prompt, history, imageDataUri);

  const payload: any = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
    },
  };

  if (context.settings.systemPrompt) {
    payload.systemInstruction = {
      parts: [{ text: context.settings.systemPrompt }],
    };
  }

  const useAiStudio = isAiStudio(context.settings);
  const customKey = useAiStudio
    ? getAiStudioKey(context.settings)
    : context.settings.customApiKey?.trim() ||
      import.meta.env.VITE_JENNY_API_KEY ||
      DEFAULT_FALLBACK_KEY;

  if (context.settings.enableStreaming && onStreamChunk && customKey) {
    try {
      const streamUrl = useAiStudio
        ? `${AI_STUDIO_BASE_URL}/models/${model}:streamGenerateContent?alt=sse`
        : `https://aiplatform.googleapis.com/v1/publishers/google/models/${model}:streamGenerateContent?alt=sse&key=${customKey}`;
      const response = await fetch(streamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(useAiStudio && { 'x-goog-api-key': customKey }),
        },
        body: JSON.stringify(payload),
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulated = '';
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              const jsonStr = trimmed.slice(5).trim();
              if (!jsonStr || jsonStr === '[DONE]') continue;
              try {
                const parsed = JSON.parse(jsonStr);
                const chunkText =
                  parsed.candidates?.[0]?.content?.parts
                    ?.map((p: any) => p.text || '')
                    .join('') || '';
                if (chunkText) {
                  accumulated += chunkText;
                  onStreamChunk(accumulated);
                }
              } catch {
                // ignore partial JSON line
              }
            }
          }
        }

        if (accumulated) {
          return accumulated;
        }
      }
    } catch {
      // Fallback to synchronous generateContent
    }
  }

  const endpointPath = `${getModelPath(model, context.settings)}:generateContent`;
  const data = await executeRequest(endpointPath, payload, context);
  const fullText =
    data.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '';
  if (onStreamChunk && fullText) {
    onStreamChunk(fullText);
  }
  return fullText;
};

export const generateImage = async (
  prompt: string,
  model: string,
  context: ApiContext,
  refImageB64?: string | null
) => {
  const endpointPath = `${getModelPath(model, context.settings)}:generateContent`;
  const parts: any[] = [{ text: prompt || 'Generate a high quality artistic image' }];

  if (refImageB64) {
    const { mimeType, data } = parseDataUri(refImageB64);
    parts.push({ inlineData: { mimeType, data } });
  }

  const payload = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      imageConfig: { aspectRatio: context.settings.imageAspectRatio || '1:1' },
      responseModalities: ['IMAGE', 'TEXT'],
    },
  };

  const data = await executeRequest(endpointPath, payload, context);
  const candidateParts = data.candidates?.[0]?.content?.parts || [];
  const imagePart = candidateParts.find((p: any) => p.inlineData);
  const textPart = candidateParts.find((p: any) => p.text);

  if (!imagePart) {
    throw new Error(textPart?.text || 'AI response did not contain valid image data.');
  }
  return {
    imageUrl: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
    caption: textPart?.text || 'Đã tạo hình ảnh theo yêu cầu của bạn:',
  };
};


export const generateTTS = async (prompt: string, model: string, context: ApiContext) => {
  const endpointPath = `${getModelPath(model, context.settings)}:generateContent`;
  
  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: context.settings.ttsVoice || 'Puck' } }
      }
    }
  };

  const data = await executeRequest(endpointPath, payload, context);
  const audioPart = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
  
  if (!audioPart || !audioPart.data) throw new Error('AI response did not contain valid audio data.');
  const mimeType = audioPart.mimeType || 'audio/mp3';
  return `data:${mimeType};base64,${audioPart.data}`;
};

export const initiateVideoGen = async (prompt: string, model: string, context: ApiContext) => {
  if (isAiStudio(context.settings)) {
    throw new Error('Tạo video (Veo) chỉ hỗ trợ qua Vertex AI. Đổi Nhà cung cấp sang Vertex AI trong Cấu hình.');
  }
  const projectNumber = context.settings.projectId || 'no-coop-300usd-project';
  const endpointPath = `projects/${projectNumber}/locations/us-central1/publishers/google/models/${model}:predictLongRunning`;

  const payload = {
    instances: [{ prompt }],
    parameters: {
      aspectRatio: '16:9',
      durationSeconds: 6,
      sampleCount: 1
    }
  };

  const data = await executeRequest(endpointPath, payload, context, true);
  if (!data.name) throw new Error('Failed to initiate video generation, no operation name returned.');
  return data.name; 
};

export const pollVideoGen = async (operationName: string, model: string, context: ApiContext) => {
  const projectNumber = context.settings.projectId || 'no-coop-300usd-project';
  const endpointPath = `projects/${projectNumber}/locations/us-central1/publishers/google/models/${model}:fetchPredictOperation`;

  const data = await executeRequest(endpointPath, { operationName }, context, true);
  
  if (data.done) {
    if (data.error) throw new Error(data.error.message || 'Video generation failed.');
    
    const videos = data.response?.videos || data.response?.generatedVideos || [];
    const firstVideo = videos[0];
    const videoData = firstVideo?.bytesBase64Encoded || firstVideo?.video?.bytesBase64Encoded;
    const mimeType = firstVideo?.mimeType || firstVideo?.video?.mimeType || 'video/mp4';

    if (!videoData) throw new Error('Video data is empty.');

    return { done: true, videoUrl: `data:${mimeType};base64,${videoData}`, mimeType };
  }
  return { done: false };
};
