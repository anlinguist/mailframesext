(() => {
    console.log("auth script loaded");
    function handleMessage(event: MessageEvent) {
        let allowedOrigins = ['https://www.mailframes.com', 'https://mailframes.com', 'http://localhost:5173'];
        if (!allowedOrigins.includes(event.origin)) {
            return;
        }
        console.log('Message received from', event.origin);
        console.log('Message data:', event.data);

        const data = event.data;

        if (typeof data !== 'object' || data === null) {
            return;
        }

        const { type, customToken, signOut } = data;

        if (type === 'AUTH_MESSAGE') {
            if (customToken) {
                chrome.storage.local.remove("signOut");
                chrome.storage.local.set({ customToken }, () => {
                    console.log('Custom token saved to storage.');
                });
            }

            if (signOut) {
                chrome.storage.local.remove('customToken');
                chrome.storage.local.set({ signOut: true }, () => {
                    console.log('Sign-out flag saved to storage.');
                });
            }
        }
    }

    window.addEventListener('message', handleMessage, false);
})();