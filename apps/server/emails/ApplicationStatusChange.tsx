import React from 'react';
import { Html, Text } from '@react-email/components';

export interface ApplicationStatusChangeProps {
    status: string;
    jobTitle: string;
}

export default function ApplicationStatusChange({
    status,
    jobTitle,
}: ApplicationStatusChangeProps) {
    return (
        <Html>
            <Text>
                Your application for {jobTitle} has been updated to: {status}.
            </Text>
        </Html>
    );
}