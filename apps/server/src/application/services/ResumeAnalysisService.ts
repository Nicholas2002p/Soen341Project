import type { IAiService } from '../interfaces/services/IAiService.js';
import type { IResumeAnalysisService } from '../interfaces/services/IResumeAnalysisService.js';
import type { ResumeProfile } from '../../domain/entities/ResumeProfile.js';
import { AiServiceError } from '../../domain/errors/AiServiceError.js';

// Keeps the prompt small enough for the free Gemini tier.
const MAX_RESUME_TEXT_LENGTH = 20000;

const RESUME_PROFILE_SCHEMA = {
    type: 'OBJECT',
    properties: {
        skills: { type: 'ARRAY', items: { type: 'STRING' } },
        certifications: { type: 'ARRAY', items: { type: 'STRING' } },
        experience: { type: 'ARRAY', items: { type: 'STRING' } },
    },
    required: ['skills', 'certifications', 'experience'],
};

export class ResumeAnalysisService implements IResumeAnalysisService {
    constructor(private readonly aiService: IAiService) {}

    async extractProfile(resumeText: string): Promise<ResumeProfile> {
        const text = resumeText.trim().slice(0, MAX_RESUME_TEXT_LENGTH);

        if (!text) {
            throw new AiServiceError('The resume does not contain any readable text.');
        }

        const response = await this.aiService.generateText(buildPrompt(text), {
            temperature: 0,
            responseMimeType: 'application/json',
            responseSchema: RESUME_PROFILE_SCHEMA,
        });

        return parseResumeProfile(response);
    }
}

function buildPrompt(resumeText: string): string {
    return [
        'You read resumes for a job platform.',
        'Extract the following information from the resume below:',
        '- skills: technical and professional skills (for example "React", "SQL", "Customer service").',
        '- certifications: certifications, licenses and diplomas.',
        '- experience: one short line per job or project (for example "Software developer intern at Acme, 2024").',
        'Only use information written in the resume. Do not invent anything.',
        'Return empty lists when nothing matches.',
        '',
        'Resume:',
        '"""',
        resumeText,
        '"""',
    ].join('\n');
}

function parseResumeProfile(response: string): ResumeProfile {
    let data: unknown;

    try {
        data = JSON.parse(response);
    } catch (error) {
        throw new AiServiceError('The AI service returned an invalid resume profile.', { cause: error });
    }

    if (typeof data !== 'object' || data === null) {
        throw new AiServiceError('The AI service returned an invalid resume profile.');
    }

    const record = data as Record<string, unknown>;

    return {
        skills: toStringList(record.skills),
        certifications: toStringList(record.certifications),
        experience: toStringList(record.experience),
    };
}

function toStringList(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}
