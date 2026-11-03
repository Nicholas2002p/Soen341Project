import type {
    EmailMessage,
    EmailTemplate,
    IEmailService,
    IEmailTemplateLoader,
} from '../../src/application/interfaces/infrastructure/IEmailService.js';

export class DummyEmailService implements IEmailService {
    messages: EmailMessage[] = [];

    async send<TProps extends Record<string, unknown>>(message: EmailMessage<TProps>): Promise<void> {
        this.messages.push(message);
    }
}

export class DummyEmailTemplateLoader implements IEmailTemplateLoader {
    loadedTemplates: string[] = [];

    constructor(private readonly template: EmailTemplate) {}

    async load(templateName: string): Promise<EmailTemplate> {
        this.loadedTemplates.push(templateName);
        return this.template;
    }
}

export class DummySendGridClient {
    sentEmails: unknown[] = [];

    async send(email: unknown): Promise<void> {
        this.sentEmails.push(email);
    }
}
