/// <reference lib="webworker" />

class EventHandlerMap {
    private static instance: EventHandlerMap;

    private constructor() { }

    public static getIntance(): EventHandlerMap {
        if (!EventHandlerMap.instance) {
            EventHandlerMap.instance = new EventHandlerMap();
        }
        return EventHandlerMap.instance;
    }

    async handleMessage(message: any, sender: chrome.runtime.MessageSender): Promise<any> {
        let { type } = message;
        switch (type) {
            case 'configure_side_panel': {
                await chrome.sidePanel.setOptions({
                    tabId: sender?.tab?.id,
                    path: 'popup/index.html#/',
                    enabled: true
                });
                return { tabId: sender?.tab?.id }
            }
                break;
            case 'open_side_panel': {
                await chrome.sidePanel.open({ tabId: sender?.tab?.id || 0 });
                return { tabId: sender?.tab?.id }
            }
                break;
            case 'update_draft': {
                const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                let tab = tabs[0];
                chrome.tabs.sendMessage(tab?.id ?? 0, message);
            }
                break;
        }
    }
}

export const eventHandlerMap = EventHandlerMap.getIntance();