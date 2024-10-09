import { eventHandlerMap } from "./ehm";

class BackgroundServiceWorker {
    runtimeOnMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void): Boolean {
        (async () => {
            if (sender.id === chrome.runtime.id) {
                let response = await eventHandlerMap.handleMessage(message, sender);
                sendResponse(response);
            }
        })();
        return true;
    }
}

const backgroundServiceWorker = new BackgroundServiceWorker();

chrome.runtime.onMessage.addListener(backgroundServiceWorker.runtimeOnMessage.bind(backgroundServiceWorker));