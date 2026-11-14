import type { TriviaQuestion } from './triviaApi';

export type TranslationLanguage = 'fi' | 'ru';

export interface TranslatedQuestion {
  question: string;
  answers: string[];
  category: string;
}

export type TranslationRequest =
  | { type: 'translate'; id: number; language: TranslationLanguage; texts: string[] }
  | { type: 'cancel'; id: number };

export type TranslationResponse =
  | { id: number; translations: string[] }
  | { id: number; error: string };

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, {
  resolve: (translations: string[]) => void;
  reject: (error: Error) => void;
}>();

function getWorker(): Worker {
  if (worker) return worker;

  const instance = new Worker(new URL('./translationWorker.ts', import.meta.url), { type: 'module' });
  instance.onmessage = (event: MessageEvent<TranslationResponse>) => {
    const request = pending.get(event.data.id);
    if (!request) return;
    pending.delete(event.data.id);
    if ('error' in event.data) request.reject(new Error(event.data.error));
    else request.resolve(event.data.translations);
  };
  instance.onerror = (event) => {
    for (const request of pending.values()) request.reject(new Error(event.message || 'Translation worker failed'));
    pending.clear();
    instance.terminate();
    worker = null;
  };
  worker = instance;
  return instance;
}

function translateTexts(texts: string[], language: TranslationLanguage, signal: AbortSignal): Promise<string[]> {
  if (signal.aborted) return Promise.reject(new DOMException('Translation cancelled', 'AbortError'));

  const instance = getWorker();
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    const cancel = () => {
      pending.delete(id);
      instance.postMessage({ type: 'cancel', id } satisfies TranslationRequest);
      reject(new DOMException('Translation cancelled', 'AbortError'));
    };
    signal.addEventListener('abort', cancel, { once: true });
    pending.set(id, {
      resolve: (value) => {
        signal.removeEventListener('abort', cancel);
        resolve(value);
      },
      reject: (error) => {
        signal.removeEventListener('abort', cancel);
        reject(error);
      },
    });
    instance.postMessage({ type: 'translate', id, language, texts } satisfies TranslationRequest);
  });
}

export async function translateQuestion(
  question: TriviaQuestion,
  language: TranslationLanguage,
  signal: AbortSignal,
): Promise<TranslatedQuestion> {
  const booleanAnswers = language === 'fi'
    ? { True: 'Tosi', False: 'Epätosi' }
    : { True: 'Верно', False: 'Неверно' };
  const preserveAnswer = (answer: string) =>
    (question.type === 'boolean' && (answer === 'True' || answer === 'False')) ||
    (/\bSQL\b/i.test(question.question) && /^[A-Z][A-Z0-9_]*$/.test(answer));
  const answersToTranslate = question.answers.filter((answer) =>
    !preserveAnswer(answer),
  );
  const [translatedQuestion, category, ...translatedAnswers] = await translateTexts(
    [question.question, question.category, ...answersToTranslate],
    language,
    signal,
  );
  let answerIndex = 0;
  const answers = question.answers.map((answer) =>
    preserveAnswer(answer)
      ? answer === 'True' || answer === 'False' ? booleanAnswers[answer] : answer
      : translatedAnswers[answerIndex++],
  );
  const normalizedAnswers = answers.map((answer) => answer.trim().toLocaleLowerCase(language));
  const originalQuotes = [...question.question.matchAll(/["“]([^"“”]+)["”]/g)];
  const translatedQuotes = [...translatedQuestion.matchAll(/["“]([^"“”]+)["”]/g)];
  let quoteIndex = 0;
  const questionText = originalQuotes.length === translatedQuotes.length
    ? translatedQuestion.replace(/["“]([^"“”]+)["”]/g, () => originalQuotes[quoteIndex++][0])
    : translatedQuestion;
  return {
    question: questionText,
    category,
    answers: answers.map((answer, index) =>
      normalizedAnswers.indexOf(normalizedAnswers[index]) !== normalizedAnswers.lastIndexOf(normalizedAnswers[index])
        ? `${answer} (${question.answers[index]})`
        : answer,
    ),
  };
}
