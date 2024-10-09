// @ts-nocheck
import { Button } from '@mantine/core';

function LoginButton(props: any) {

    return (
        <Button
            color="mfgreen.8"
            variant="outline"
            radius="xl"
            size="sm"
            {...props}
            onClick={() => {
                if (props.onClick) {
                    props.onClick();
                }
                chrome.tabs.create({ url: 'https://www.mailframes.com' });
            }}
        >
            Login
        </Button>
    )
}

export default LoginButton