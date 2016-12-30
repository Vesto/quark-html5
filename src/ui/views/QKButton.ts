import { Button, ButtonBacking, Appearance, Label, AppearanceStyle, TextAlignmentMode, TextVerticalAlignmentMode } from "quark";
import { QKView } from "./QKView";

export class QKButton extends QKView implements ButtonBacking {
    protected get qk_button(): Button { return this.qk_view as Button; }

    private titleLabel: Label;

    public constructor() {
        super();
    }

    public qk_init() {
        super.qk_init();

        // Create a new label
        if (!this.qk_view) { return; }
        this.titleLabel = new this.qk_lib.Label();
        this.titleLabel.alignmentMode = TextAlignmentMode.Center;
        this.titleLabel.verticalAlignmentMode = TextVerticalAlignmentMode.Center;
        this.qk_view.addSubview(this.titleLabel);
    }

    public qk_appearanceChanged(appearance: Appearance) {
        super.qk_appearanceChanged(appearance);

        this.restyleButton();
    }

    public qk_setTitle(title: string) { this.titleLabel.text = title; }

    public qk_setIsEnabled(enabled: boolean) { this.restyleButton(); }

    public qk_setIsEmphasized(emphasized: boolean) { this.restyleButton(); }

    private restyleButton() {
        if (!this.qk_view) { return; }

        // Get the appropriate style
        let appearance = this.qk_view.appearance;
        let style: AppearanceStyle;
        if (!this.qk_button.isEnabled) {
            style = appearance.disabledControl;
        } else if (this.qk_button.isEmphasized) {
            style = appearance.activeControl;
        } else {
            style = appearance.normalControl;
        }

        // Style the view
        style.styleView(this.qk_view, this.titleLabel);
    }

    public _qk_layout() {
        super._qk_layout();

        this.titleLabel.rect = this.qk_view.rect.bounds;
    }
}

// Register the element with the window
window.customElements.define("qk-button", QKButton);
export function createButtonBacking(): ButtonBacking { return new QKButton(); }
