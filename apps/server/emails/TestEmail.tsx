import React from 'react';
import { Html, Text } from '@react-email/components';

export interface TestEmailProps {
    message: string;
}

export default function TestEmail({ message }: TestEmailProps) {
    return (
        <Html>
            <Text>{message}</Text>
        </Html>
    );
}
