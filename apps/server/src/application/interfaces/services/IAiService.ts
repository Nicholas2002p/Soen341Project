export interface AiGenerationOptions {
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: 'text/plain' | 'application/json';
    responseSchema?: Record<string, unknown>;
}


export interface IAiService {
    generateText(prompt: string, options?: AiGenerationOptions): Promise<string>;
}
