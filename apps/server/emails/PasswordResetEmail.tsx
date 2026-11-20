import React from 'react';
import { Html, Text } from '@react-email/components';

export interface PasswordResetEmailProps {
    resetUrl: string;
    expiresInMinutes: number;
}

export default function PasswordResetEmail({ resetUrl, expiresInMinutes }: PasswordResetEmailProps) {
    return (
        <Html>
            <Text>We received a request to reset your CareerConnect password.</Text>
            <a
                href={resetUrl}
                style={{
                    display: 'inline-block',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    padding: '12px 18px',
                    textDecoration: 'none',
                    borderRadius: '6px',
                }}
            >
                Reset your password
            </a>
            <Text>This link expires in {expiresInMinutes} minutes and can only be used once.</Text>
            <Text>If you did not request this, you can safely ignore this email.</Text>
        </Html>
    );
}
