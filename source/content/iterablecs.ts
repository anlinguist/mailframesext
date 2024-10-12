import { MailFrames } from "../assets/MailFramesBaseCS";

class MailFramesITBL extends MailFrames {
    static instance: MailFramesITBL | null = null;

    static getInstance() {
        if (this.instance === null) {
            this.instance = new MailFramesITBL();
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

MailFramesITBL.getInstance();