import { MailFrames } from "../assets/MailFramesBaseCS";

class MailFramesGoogle extends MailFrames {
    static instance: MailFramesGoogle | null = null;

    static getInstance() {
        if (this.instance === null) {
            this.instance = new MailFramesGoogle();
        }
        return this.instance;
    }

    getButtonTargets() {
        let targets: NodeListOf<Element> = document.querySelectorAll('[role="textbox"]');
        if (window.location.href.includes("google")) {
            return targets;
        }
        return null;
    }

    getInjectTarget() {
        let targets: NodeListOf<Element> = document.querySelectorAll('[role="textbox"]');
        if (window.location.href.includes("google")) {
            return targets.length > 0 ? targets[0] : null;
        }
        return null;
    }
}

MailFramesGoogle.getInstance();