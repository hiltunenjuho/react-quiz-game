/// <reference lib="webworker" />

import { env, pipeline } from '@huggingface/transformers';
import type { TranslationLanguage, TranslationRequest, TranslationResponse } from './translateTrivia';

declare const self: DedicatedWorkerGlobalScope;

env.allowLocalModels = false;

const models: Partial<Record<TranslationLanguage, ReturnType<typeof loadModel>>> = {};
const cache = new Map<string, string>();
const cancelled = new Set<number>();
let queue = Promise.resolve();

function loadModel(language: TranslationLanguage) {
  return pipeline('translation', `Xenova/opus-mt-en-${language}`, { dtype: 'q8', device: 'wasm' });
}

async function getModel(language: TranslationLanguage) {
  const model = models[language] ?? loadModel(language);
  models[language] = model;
  try {
    return await model;
  } catch (error) {
    delete models[language];
    throw error;
  }
}

async function translate(request: Extract<TranslationRequest, { type: 'translate' }>) {
  if (cancelled.delete(request.id)) return;
  try {
    const missing = [...new Set(request.texts.filter((text) => !cache.has(`${request.language}:${text}`)))];
    if (missing.length) {
      const model = await getModel(request.language);
      if (cancelled.delete(request.id)) return;
      for (const text of missing) {
        const results = await model(text, { max_new_tokens: 256 });
        if (cancelled.delete(request.id)) return;
        const translated = results[0]?.translation_text;
        if (!translated?.trim()) throw new Error('Translation model returned an incomplete result');
        cache.set(`${request.language}:${text}`, translated);
      }
    }
    if (cancelled.delete(request.id)) return;
    const translations = request.texts.map((text) => {
      const translated = cache.get(`${request.language}:${text}`);
      if (translated === undefined) throw new Error('Translation model returned an incomplete result');
      return translated;
    });
    self.postMessage({ id: request.id, translations } satisfies TranslationResponse);
  } catch (error) {
    if (cancelled.delete(request.id)) return;
    self.postMessage({
      id: request.id,
      error: error instanceof Error ? error.message : 'Translation failed',
    } satisfies TranslationResponse);
  }
}

self.onmessage = (event: MessageEvent<TranslationRequest>) => {
  const request = event.data;
  if (request.type === 'cancel') {
    cancelled.add(request.id);
    return;
  }
  queue = queue.then(() => translate(request));
};
