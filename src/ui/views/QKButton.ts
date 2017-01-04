import { Button, ButtonBacking, Appearance, Label, LabelStyle, TextAlignmentMode, TextVerticalAlignmentMode } from "quark";
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
        this.titleLabel = new this.qk_lib.Label();
        this.titleLabel.style = LabelStyle.Text;
        this.titleLabel.alignmentMode = TextAlignmentMode.Center;
        this.titleLabel.verticalAlignmentMode = TextVerticalAlignmentMode.Center;
        this.qk_view.addSubview(this.titleLabel);
    }

    public qk_appearanceChanged(appearance: Appearance) {
        super.qk_appearanceChanged(appearance);

        this.restyleButton();
    }

    public qk_layout() {
        super.qk_layout();

        this.titleLabel.rect = this.qk_view.rect.bounds;
    }

    public qk_setTitle(title: string): void { this.titleLabel.text = title; }

    public qk_setIsEnabled(enabled: boolean): void { this.restyleButton(); }

    public qk_setIsEmphasized(emphasized: boolean): void { this.restyleButton(); }

    protected restyleButton(): void {
        // Style the view
        let appearance = this.qk_view.appearance;
        this.qk_view.cornerRadius = appearance.cornerRadius;
        if (!this.qk_button.isEnabled) { // Disabled
            this.qk_view.backgroundColor = appearance.secondaryColor;
            this.titleLabel.textColor = appearance.primaryColor.withAlpha(0.5);
        } else if (this.qk_button.isEmphasized) { // Emphasized
            this.qk_view.backgroundColor = appearance.primaryColor;
            this.titleLabel.textColor = appearance.accentColor;
        } else { // Normal
            this.qk_view.backgroundColor = appearance.secondaryColor;
            this.titleLabel.textColor = appearance.primaryColor;
        }
    }
}

// Register the element with the window
window.customElements.define("qk-button", QKButton);
export function createButtonBacking(): ButtonBacking { return new QKButton(); }
