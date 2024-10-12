import { MailFrames } from "../assets/MailFramesBaseCS";

class MailFramesKlaviyo extends MailFrames {

    static instance: MailFramesKlaviyo | null = null;

    static getInstance() {
        if (this.instance === null) {
            this.instance = new MailFramesKlaviyo();
        }
        return this.instance;
    }


    getButtonTargets() {
        let targets: NodeListOf<Element> = document.querySelectorAll('#import-form .TextArea-input');
        if (window.location.href.includes("klaviyo")) {
            return targets;
        }
        return null;
    }

    getInjectTarget() {
        let targets: NodeListOf<Element> = document.querySelectorAll('#import-form .TextArea-input');
        if (window.location.href.includes("klaviyo")) {
            return targets.length > 0 ? targets[0] : null;
        }
        return null;
    }
}

MailFramesKlaviyo.getInstance();