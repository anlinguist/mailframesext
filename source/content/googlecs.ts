class MailFrames {
    static instance: MailFrames | null = null;
    observer: MutationObserver | null;

    static getInstance() {
        if (this.instance === null) {
            this.instance = new MailFrames();
        }
        return this.instance;
    }

    constructor() {
        this.observer = null;
        this.init();
    }

    white_logo = `<svg width="17"
                    height="16"
                    viewBox="0 0 1200 1145" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M150 395V995H1050V395H150ZM25 245C11.1929 245 0 256.193 0 270V1120C0 1133.81 11.1929 1145 25 1145H1175C1188.81 1145 1200 1133.81 1200 1120V270C1200 256.193 1188.81 245 1175 245H25ZM149.996 283L150 358L70 283H149.996ZM1050 283H150V358H1050L1130 283H1050L1050 358V283ZM150 1035L149.996 1110H70L150 1035ZM150 1110H1050V1035L1050 1110H1130L1050 1035H150V1110ZM38 394.996L113 395L38 315V394.996ZM113 395V995H38V395H113ZM38 995.004L113 995L38 1075V995.004ZM1094 395L1169 394.996V315L1094 395ZM1094 995V395H1169V995H1094ZM1094 995L1169 1075V995.004L1094 995Z" fill="white"/>
                    <path d="M590.759 15.5554C596.652 11.6061 604.348 11.6061 610.241 15.5554L943.279 238.712C957.646 248.338 950.831 270.75 933.538 270.75H267.462C250.169 270.75 243.354 248.338 257.721 238.712L590.759 15.5554Z" stroke="white" stroke-width="15"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M892.174 665L604.5 808L316.826 665H200V935H600H1000V665H892.174ZM600 935L300 935L300 785L600 935ZM600 935L900 785V935L600 935Z" fill="white"/>
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M892.174 456L604.5 599L316.826 456H200V576H300L600 726L900 576H1000V456H892.174Z" fill="white"/>
                    <circle cx="600" cy="79" r="20" fill="white"/>
                    </svg>`;

    init() {
        this.observeDOM();
    }

    observeDOM() {
        if (this.observer) return;

        const targetNode = document.body;
        const config = {
            childList: true,
            subtree: true,
            attributes: false
        };

        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                    this.addCopyButton();
                }
            });
        });

        this.observer.observe(targetNode, config);
        this.addCopyButton();
    }

    addCopyButton() {
        let targets;
        if (window.location.href.includes("google")) {
            targets = document.querySelectorAll('[role="textbox"]');
        } else {
            targets = document.querySelectorAll("iframe")
            console.log("targets found: ", targets)
            if (targets.length === 0) {
                setTimeout(() => {
                    targets = document.querySelectorAll("iframe");
                    if (targets.length === 0) {
                        console.log("no target properly found...")
                    } else {
                        console.log("targets found: ", targets)
                    }
                }, 2000);
            }
        }
        if (targets && targets.length === 0) {
            let buttons = document.querySelectorAll('#mjml-extension-osp');
            if (buttons.length === 0) return;
            buttons.forEach((button) => {
                button.remove();
            });
            chrome.runtime.sendMessage({ type: 'close_side_panel' });
            return;
        }
        targets.forEach((target) => {
            if (!document.querySelector('#mjml-extension-osp')) {
                let button: HTMLButtonElement = document.createElement('button');
                button.innerHTML = `
                    <span style="display: flex; align-items: center;">
                        ${this.white_logo}
                        <span style="margin-left: 8px;">Mail Frames</span>
                    </span>`;
                button.id = 'mjml-extension-osp';
                document.body.appendChild(button);

                this.updateButtonPosition(button, target);

                const resizeObserver = new ResizeObserver(entries => {
                    for (let entry of entries) {
                        this.updateButtonPosition(button, entry.target);
                    }
                });
                resizeObserver.observe(target);

                const mutationObserver = new MutationObserver(mutations => {
                    mutations.forEach(mutation => {
                        this.updateButtonPosition(button, target);
                    });
                });
                const config = { attributes: true, childList: true, subtree: true };
                mutationObserver.observe(target, config);

                // Stop propagation on mouseup and click
                button.addEventListener('mouseup', (event) => {
                    event.stopPropagation();
                });
                button.addEventListener('click', (event) => {
                    event.stopPropagation();
                    this.openSidePanel();
                });
            }
        });
    }

    updateButtonPosition(button: HTMLButtonElement, target: Element) {
        const rect = target.getBoundingClientRect();
        button.style.position = 'fixed';
        button.style.bottom = (window.innerHeight - rect.bottom) + 'px';
        button.style.right = (window.innerWidth - rect.right) + 'px';
        button.style.zIndex = '1000';
    }

    async openSidePanel() {
        await chrome.runtime.sendMessage({ type: 'configure_side_panel' });
        chrome.runtime.sendMessage({ type: 'open_side_panel' })
    }

    disconnectObserver() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
}

MailFrames.getInstance();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'update_draft': {
            let targets = document.querySelectorAll('[role="textbox"]');
            if (targets.length === 0) return;
            targets.forEach((target) => {
                target.innerHTML = message.body;
            });
            targets[0].dispatchEvent(new Event('input', { bubbles: true }));
        }
            break;
    }
});