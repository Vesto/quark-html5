import { ButtonBacking, Appearance, Label } from "quark";
import { QKView } from "./QKView";

export class QKButton extends QKView implements ButtonBacking {
    private titleLabel: Label;

    public get qk_title(): string { return this.titleLabel.text; }
    public set qk_title(title: string) { this.titleLabel.text = title; }

    public constructor() {
        super();
    }

    public qk_init() {
        super.qk_init();

        // Create a new label
        if (!this.qk_view) { return; }
        this.titleLabel = new this.qk_lib.Label();
        this.qk_view.addSubview(this.titleLabel);
    }

    public qk_appearanceChanged(appearance: Appearance) {
        super.qk_appearanceChanged(appearance);

        console.log("Button appearance");

        // Style the view // TODO: Style with emphasis, etc.
        if (!this.qk_view) { return; }
        appearance.activeControl.styleView(this.qk_view, this.titleLabel);
    }

    public _qk_layout() {
        super._qk_layout();

        this.titleLabel.rect = this.qk_rect.bounds;
    }
}

// Register the element with the window
window.customElements.define("qk-button", QKButton);
export function createButtonBacking(): ButtonBacking { return new QKButton(); }
