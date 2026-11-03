import { pathToFileURL } from 'node:url';
import path from 'node:path';
import type {
    EmailTemplate,
    IEmailTemplateLoader,
} from '../../application/interfaces/infrastructure/IEmailService.js';

export class FileEmailTemplateLoader implements IEmailTemplateLoader {
    constructor(
        private readonly directory: string,
        private readonly extension = '.tsx',
    ) {}

    async load(templateName: string): Promise<EmailTemplate> {
        if (!/^[\w-]+$/.test(templateName)) {
            throw new Error(`Invalid email template name: ${templateName}`);
        }

        const templatePath = path.resolve(this.directory, `${templateName}${this.extension}`);
        const templateModule = await import(pathToFileURL(templatePath).href);
        const template = templateModule.default as unknown;

        if (typeof template !== 'function') {
            throw new Error(`Email template "${templateName}" must export a default component.`);
        }

        return template as EmailTemplate;
    }
}
