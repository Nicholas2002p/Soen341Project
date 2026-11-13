import type {
    AiGenerationOptions,
    IAiService,
} from '../../application/interfaces/services/IAiService.js';
import { AiServiceError } from '../../domain/errors/AiServiceError.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GeminiResponse {
    candidates?: {
        content?: {
            parts?: { text?: string }[];
        };
    }[];
    error?: {
        message?: string;
    };
}

type FetchFunction = typeof fetch;

export class GeminiAiService implements IAiService {
    private readonly apiKey: string | undefined;
    private readonly model: string;
    private readonly fetchFunction: FetchFunction;

    constructor(
        apiKey = process.env.GEMINI_API_KEY,
        model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
        fetchFunction: FetchFunction = fetch,
    ) {
        this.apiKey = apiKey;
        this.model = model;
        this.fetchFunction = fetchFunction;
    }

    async generateText(prompt: string, options: AiGenerationOptions = {}): Promise<string> {
        const trimmedPrompt = prompt.trim();

        if (!trimmedPrompt) {
            throw new AiServiceError('A prompt is required.');
        }

        if (!this.apiKey) {
            throw new AiServiceError('GEMINI_API_KEY must be configured.');
        }

        const url = `${GEMINI_API_URL}/${encodeURIComponent(this.model)}:generateContent?key=${encodeURIComponent(this.apiKey)}`;
        let response: Response;

        try {
            response = await this.fetchFunction(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: trimmedPrompt }] }],
                    ...(Object.keys(options).length > 0
                        ? {
                            generationConfig: {
                                ...(options.temperature === undefined ? {} : { temperature: options.temperature }),
                                ...(options.maxOutputTokens === undefined
                                    ? {}
                                    : { maxOutputTokens: options.maxOutputTokens }),
                                ...(options.responseMimeType === undefined
                                    ? {}
                                    : { responseMimeType: options.responseMimeType }),
                                ...(options.responseSchema === undefined
                                    ? {}
                                    : { responseSchema: options.responseSchema }),
                            },
                        }
                        : {}),
                }),
            });
        } catch (error) {
            throw new AiServiceError('The Gemini API could not be reached.', { cause: error });
        }

        const payload = await readGeminiResponse(response);

        if (!response.ok) {
            throw new AiServiceError(payload.error?.message ?? 'The Gemini API returned an error.');
        }

        const text = payload.candidates
            ?.flatMap((candidate) => candidate.content?.parts ?? [])
            .map((part) => part.text ?? '')
            .join('')
            .trim();

        if (!text) {
            throw new AiServiceError('The Gemini API returned an empty response.');
        }

        return text;
    }
}

async function readGeminiResponse(response: Response): Promise<GeminiResponse> {
    try {
        return (await response.json()) as GeminiResponse;
    } catch (error) {
        throw new AiServiceError('The Gemini API returned an invalid response.', { cause: error });
    }
}
