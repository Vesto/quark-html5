import { TextField, TextFieldBacking, Appearance, AppearanceStyle } from "quark";
import { QKLabel } from "./QKLabel";

declare global {
    interface CSSStyleDeclaration {
        // See https://css-tricks.com/snippets/css/password-input-bullet-alternatives/
        webkitTextSecurity: string | undefined;
    }
}

export class QKTextField extends QKLabel implements TextFieldBacking {
    protected get qk_textField(): TextField { return this.qk_view as TextField; }

    public qk_contentChangeCallback: (text: string) => void;

    public constructor() {
        super();

        // Allow the content to be edited
        this.contentEditable = "true";

        // Observe text mutations
        new MutationObserver(() => {
            this.qk_contentChangeCallback(this.textContent ? this.textContent : "");
        }).observe(this, { characterData: true, subtree: true });
    }

    public qk_appearanceChanged(appearance: Appearance): void {
        super.qk_appearanceChanged(appearance);

        this.restyleField();
    }

    public qk_setFocusable(focusable: boolean): void {
        // Make sure this view is always focusable
        super.qk_setFocusable(true);
    }

    protected _qk_handleFocusEvent(event: FocusEvent): void {
        super._qk_handleFocusEvent(event);

        // Restyle to match focus
        this.restyleField();
    }

    public qk_setIsEnabled(enabled: boolean): void {
        // TODO: Disable editing and such
        this.restyleField();
    }

    public qk_setIsSecure(secure: boolean): void {
        this.style.webkitTextSecurity = secure ? "disc" : "none";
    }

    protected restyleField(): void {
        if (!this.qk_view) { return; }

        // Get the appropriate style
        let appearance = this.qk_view.appearance;
        let style: AppearanceStyle;
        if (!this.qk_textField.isEnabled) {
            style = appearance.alternateDisabledControl;
        } else if (this.qk_textField.isFocused) {
            style = appearance.alternateActiveControl;
        } else {
            style = appearance.alternateNormalControl;
        }

        // Style the view
        style.styleView(this.qk_view);
    }
}

// Register the element with the window
window.customElements.define("qk-text-field", QKTextField);
export function createTextFieldBacking(): TextFieldBacking { return new QKTextField(); }
