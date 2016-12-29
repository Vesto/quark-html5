import { ButtonBacking, Appearance, Label, AppearanceStyle } from "quark";
import { QKView } from "./QKView";

export class QKButton extends QKView implements ButtonBacking {
    private titleLabel: Label;

    private _qk_isEnabled: boolean;
    public get qk_isEnabled(): boolean { return this._qk_isEnabled; }
    public set qk_isEnabled(enabled: boolean) {
        this._qk_isEnabled = enabled;
        this._restyleButton();
    }

    private _qk_isEmphasized: boolean;
    public get qk_isEmphasized(): boolean { return this._qk_isEmphasized; }
    public set qk_isEmphasized(emphasized: boolean) {
        this._qk_isEmphasized = emphasized;
        this._restyleButton();
    }

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

        this._restyleButton();

    }

    private _restyleButton() {
        if (!this.qk_view) { return; }

        // Get the appropriate style
        let appearance = this.qk_view.appearance;
        let style: AppearanceStyle;
        if (!this._qk_isEnabled) {
            style = appearance.disabledControl;
        } else if (this.qk_isEmphasized) {
            style = appearance.activeControl;
        } else {
            style = appearance.normalControl;
        }

        // Style the view
        style.styleView(this.qk_view, this.titleLabel);
    }

    public _qk_layout() {
        super._qk_layout();

        this.titleLabel.rect = this.qk_rect.bounds;
    }
}

// Register the element with the window
window.customElements.define("qk-button", QKButton);
export function createButtonBacking(): ButtonBacking { return new QKButton(); }
