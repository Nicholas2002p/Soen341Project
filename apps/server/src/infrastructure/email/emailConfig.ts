import path from 'node:path';

export const emailConfig = {
    from: process.env.SENDGRID_FROM_EMAIL ?? '',
    templatesDirectory: path.resolve(
        process.env.EMAIL_TEMPLATES_DIRECTORY ?? path.join(process.cwd(), 'emails'),
    ),
    templateExtension: process.env.EMAIL_TEMPLATE_EXTENSION ?? '.tsx',
};
