// @ts-nocheck
import { Center, Stack, Text } from '@mantine/core'
import { useState } from 'react';
import LoginButton from './LoginButton';

function SignInUI({ message, callback }: any) {
    const [error, setError] = useState('');

    return (
        <Stack>
            {/* Welcome Message */}
            <Center>
                <Text size="md" fw={500}>
                    {message ?? `Welcome! Please sign in to continue`}
                </Text>
            </Center>
            <LoginButton
                visibleFrom='xs'
                onClick={() => {}}
              />
        </Stack>
    )
}

export default SignInUI