import { Html, Text } from '@react-email/components';

export interface WelcomeEmailProps {
    firstName: string;
}

export default function WelcomeEmail({ firstName }: WelcomeEmailProps) {
    return (
        <Html>
            <Text>Welcome to CareerConnect, {firstName}.</Text>
        </Html>
    );
}
