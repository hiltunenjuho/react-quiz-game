export interface TriviaCategory {
  id: number;
  name: string;
}

export interface TriviaQuestion {
  question: string;
  correctAnswer: string;
  answers: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple' | 'boolean';
}

export interface TriviaOptions {
  amount: number;
  category?: number;
  difficulty?: string;
  type?: string;
  token?: string;
}

export class TriviaApiError extends Error {
  responseCode: number;

  constructor(responseCode: number) {
    super(`Open Trivia DB returned response code ${responseCode}`);
    this.name = 'TriviaApiError';
    this.responseCode = responseCode;
  }
}

export class NoQuestionsError extends Error {
  constructor() {
    super('Open Trivia DB found no questions for this selection');
    this.name = 'NoQuestionsError';
  }
}

interface ApiQuestion {
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple' | 'boolean';
}

interface ApiQuestionResponse {
  response_code: number;
  results: ApiQuestion[];
}

interface ApiTokenResponse {
  response_code: number;
  response_message?: string;
  token: string;
}

interface ApiCategoryResponse {
  trivia_categories: TriviaCategory[];
}

const API_BASE = 'https://opentdb.com';
const QUESTION_REQUEST_INTERVAL = 5100;

function waitForQuestionRequest(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, QUESTION_REQUEST_INTERVAL));
}

function decodeBase64(value: string): string {
  const bytes = Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function requestJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (response.status === 429) throw new TriviaApiError(5);
  if (!response.ok) throw new Error(`Open Trivia DB returned HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

export async function fetchCategories(signal?: AbortSignal): Promise<TriviaCategory[]> {
  const response = await requestJson<ApiCategoryResponse>(`${API_BASE}/api_category.php`, signal);
  if (!Array.isArray(response.trivia_categories)) throw new Error('Invalid category response from Open Trivia DB');
  return response.trivia_categories;
}

async function requestToken(): Promise<string> {
  const response = await requestJson<ApiTokenResponse>(`${API_BASE}/api_token.php?command=request`);
  if (response.response_code !== 0 || !response.token) {
    throw new TriviaApiError(response.response_code);
  }
  return response.token;
}

async function resetToken(token: string): Promise<void> {
  const params = new URLSearchParams({ command: 'reset', token });
  const response = await requestJson<ApiTokenResponse>(`${API_BASE}/api_token.php?${params}`);
  if (response.response_code !== 0) throw new TriviaApiError(response.response_code);
}

function shuffle<T>(items: T[]): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}

export async function loadTriviaQuestions(options: TriviaOptions): Promise<{ questions: TriviaQuestion[]; token: string }> {
  let token = options.token || await requestToken();
  const params = new URLSearchParams({
    amount: String(options.amount),
    encode: 'base64',
    token,
  });
  if (options.category) params.set('category', String(options.category));
  if (options.difficulty) params.set('difficulty', options.difficulty);
  if (options.type) params.set('type', options.type);

  let response = await requestJson<ApiQuestionResponse>(`${API_BASE}/api.php?${params}`);
  if (response.response_code === 4) {
    await resetToken(token);
    await waitForQuestionRequest();
    response = await requestJson<ApiQuestionResponse>(`${API_BASE}/api.php?${params}`);
  } else if (response.response_code === 3) {
    token = await requestToken();
    params.set('token', token);
    await waitForQuestionRequest();
    response = await requestJson<ApiQuestionResponse>(`${API_BASE}/api.php?${params}`);
  }

  if (response.response_code === 1) throw new NoQuestionsError();
  if (response.response_code !== 0) throw new TriviaApiError(response.response_code);

  const questions = response.results.map((question) => ({
    question: decodeBase64(question.question),
    correctAnswer: decodeBase64(question.correct_answer),
    answers: shuffle([
      ...question.incorrect_answers.map(decodeBase64),
      decodeBase64(question.correct_answer),
    ]),
    category: decodeBase64(question.category),
    difficulty: question.difficulty,
    type: question.type,
  }));
  return { questions, token };
}

export async function loadSurvivalQuestions(options: Omit<TriviaOptions, 'difficulty'>): Promise<{ questions: TriviaQuestion[]; token: string }> {
  if (!Number.isInteger(options.amount) || options.amount < 1 || options.amount > 50) {
    throw new RangeError('Survival question count must be between 1 and 50');
  }

  const difficulties = ['easy', 'medium', 'hard'] as const;
  const questions: TriviaQuestion[] = [];
  let token = options.token;

  for (const [index, difficulty] of difficulties.entries()) {
    const amount = Math.floor(options.amount / difficulties.length) + (index < options.amount % difficulties.length ? 1 : 0);
    if (amount === 0) continue;
    if (questions.length > 0) await waitForQuestionRequest();
    const result = await loadTriviaQuestions({ ...options, amount, difficulty, token });
    if (result.questions.length !== amount || result.questions.some((question) => question.difficulty !== difficulty)) {
      throw new Error(`Open Trivia DB returned an invalid ${difficulty} question batch`);
    }
    questions.push(...result.questions);
    token = result.token;
  }

  if (!token) throw new Error('Could not create a survival trivia session');
  return { questions, token };
}
