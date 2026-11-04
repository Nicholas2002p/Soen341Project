import React from 'react';
import { Html, Text } from '@react-email/components';

export interface NewApplicationProps {
    jobTitle: string;
    applicantEmail: string;
}

export default function NewApplication({
    jobTitle,
    applicantEmail,
}: NewApplicationProps) {
    return (
        <Html>
            <Text>
                A new application was submitted for {jobTitle} by {applicantEmail}.
            </Text>
        </Html>
    );
}