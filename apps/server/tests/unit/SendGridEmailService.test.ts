import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { SendGridEmailService } from '../../src/infrastructure/email/SendGridEmailService.js';
import {
    DummyEmailTemplateLoader,
    DummySendGridClient,
} from '../fakes/EmailFakes.js';

console.log('\n=== tests/unit/SendGridEmailService.test.ts ===');

test('renders the selected template and sends it through SendGrid', async () => {
    const templateElement = React.createElement('div', null, 'Welcome');
    const loader = new DummyEmailTemplateLoader(() => templateElement);
    const client = new DummySendGridClient();
    const service = new SendGridEmailService(loader, 'no-reply@example.com', client);

    await service.send({
        to: 'person@example.com',
        subject: 'Welcome',
        template: 'WelcomeEmail',
        props: { firstName: 'Person' },
    });

    assert.deepEqual(loader.loadedTemplates, ['WelcomeEmail']);
    assert.deepEqual(client.sentEmails, [{
        from: 'no-reply@example.com',
        to: 'person@example.com',
        subject: 'Welcome',
        html: '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><!--$--><div>Welcome</div><!--/$-->',
    }]);
});

test('surfaces errors returned by SendGrid', async () => {
    const sendGridError = new Error('SendGrid failed');
    const loader = new DummyEmailTemplateLoader(() => React.createElement('div'));
    const client: DummySendGridClient = {
        sentEmails: [],
        send: async () => {
            throw sendGridError;
        },
    };
    const service = new SendGridEmailService(loader, 'no-reply@example.com', client);

    await assert.rejects(
        service.send({
            to: 'person@example.com',
            subject: 'Welcome',
            template: 'WelcomeEmail',
            props: {},
        }),
        sendGridError,
    );
});
