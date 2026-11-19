import type { ReactElement } from 'react';

export type EmailRecipient = string | string[];

export interface EmailMessage<TProps extends Record<string, unknown> = Record<string, unknown>> {
    to: EmailRecipient;
    subject: string;
    template: string;
    props: TProps;
}

export interface IEmailService {
    send<TProps extends Record<string, unknown>>(message: EmailMessage<TProps>): Promise<void>;
}

export type EmailTemplate = (props: Record<string, unknown>) => ReactElement;

export interface IEmailTemplateLoader {
    load(templateName: string): Promise<EmailTemplate>;
}
