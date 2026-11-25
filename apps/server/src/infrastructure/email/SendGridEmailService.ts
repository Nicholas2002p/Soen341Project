import sgMail, { type MailDataRequired } from '@sendgrid/mail';
import { render } from '@react-email/render';
import type {
    EmailMessage,
    IEmailService,
    IEmailTemplateLoader,
} from '../../application/interfaces/infrastructure/IEmailService.js';

export interface SendGridEmailClient {
    send(message: MailDataRequired): Promise<unknown>;
}

function createSendGridClient(apiKey: string | undefined): SendGridEmailClient {
    if (!apiKey) {
        throw new Error('SENDGRID_API_KEY must be configured to send email.');
    }

    sgMail.setApiKey(apiKey);
    return sgMail;
}

export class SendGridEmailService implements IEmailService {
    constructor(
        private readonly templateLoader: IEmailTemplateLoader,
        private readonly from: string,
        private readonly client: SendGridEmailClient = createSendGridClient(
            process.env.SENDGRID_API_KEY,
        ),
    ) {}

    async send<TProps extends Record<string, unknown>>(
        message: EmailMessage<TProps>,
    ): Promise<void> {
        const template = await this.templateLoader.load(message.template);
        const html = await render(template(message.props));
        const email: MailDataRequired = {
            from: this.from,
            to: message.to,
            subject: message.subject,
            html,
        };

        await this.client.send(email);
    }
}
