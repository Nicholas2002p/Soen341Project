import type {
    EmailMessage,
    IEmailService,
} from '../../application/interfaces/infrastructure/IEmailService.js';

export class NoopEmailService implements IEmailService {
    async send<TProps extends Record<string, unknown>>(
        _message: EmailMessage<TProps>,
    ): Promise<void> {
        return undefined;
    }
}
