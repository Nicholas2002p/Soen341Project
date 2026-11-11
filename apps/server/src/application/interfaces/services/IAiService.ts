export interface AiGenerationOptions {
    temperature?: number;
    maxOutputTokens?: number;
}

export interface IAiService {
    generateText(prompt: string, options?: AiGenerationOptions): Promise<string>;
}
