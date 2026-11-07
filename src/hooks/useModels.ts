import { useEffect, useRef } from 'react';
import { useChatStore } from './useChatStore';
import { DEFAULT_MODELS, DEFAULT_MODEL_BY_PROVIDER } from '../constants/models';
import { listAiStudioModels } from '../services/jennyApi';
import { toAiStudioModel } from '../services/modelCatalog';
import type { AIModel } from '../types/chat';

const CATALOG_TTL_MS = 6 * 60 * 60 * 1000;

// The models offered for the current provider. AI Studio uses the catalog fetched from the API
// (so it follows what the key can really use); Vertex has no key-based listing, so it uses the
// built-in list. Custom models the user added by id are always included.
export function useModels() {
  const { settings, customModels, remoteModels, activeModelId } = useChatStore();
  const provider = settings.provider ?? 'aistudio';

  const builtIn: AIModel[] =
    provider === 'aistudio' && remoteModels.length > 0
      ? remoteModels
      : DEFAULT_MODELS.filter((m) => !m.providers || m.providers.includes(provider));

  const allModels = [...builtIn, ...customModels];
  const activeModel =
    allModels.find((m) => m.id === activeModelId) ??
    allModels.find((m) => m.id === DEFAULT_MODEL_BY_PROVIDER[provider]) ??
    allModels[0] ??
    DEFAULT_MODELS[0];

  return { provider, builtIn, customModels, allModels, activeModel };
}

// Mount once (App): refreshes the AI Studio catalog on start when stale and whenever the key changes.
// A failed fetch keeps whatever is cached, so the app still works offline or when Google is flaky.
export function useModelCatalogSync() {
  const { settings, remoteModelsAt, setRemoteModels } = useChatStore();
  const provider = settings.provider ?? 'aistudio';
  const firstRun = useRef(true);

  useEffect(() => {
    if (provider !== 'aistudio') return;
    const isFirst = firstRun.current;
    firstRun.current = false;
    if (isFirst && remoteModelsAt && Date.now() - remoteModelsAt < CATALOG_TTL_MS) return;

    let cancelled = false;
    listAiStudioModels(settings)
      .then((raw) => {
        if (cancelled) return;
        const models = raw.map(toAiStudioModel).filter((m): m is AIModel => m !== null);
        if (models.length > 0) setRemoteModels(models);
      })
      .catch(() => {
        // keep the cached catalog
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, settings.aiStudioApiKey]);
}
