import { Label, LabelBacking, Font, Color, LineBreakMode, TextAlignmentMode, TextVerticalAlignmentMode } from "quark";
import { colorToCSS, QKView } from "./QKView";

export class QKLabel extends QKView implements LabelBacking {
    private get qk_label(): Label { return this.qk_view as Label; }

    public constructor() {
        super();

        // Use a flexbox so it can align the text properly
        this.style.display = "flex";
    }

    public qk_setText(text: string) { this.textContent = text; }

    public qk_setFont(font: Font) {
        // Assign the style
        this.style.fontSize = font.size.toCSS();
        this.style.fontFamily = `"${font.family}"`;
        this.style.fontStyle = font.italic ? "italic" : "normal";
        this.style.fontWeight = font.weight.toString();
        let stretches = [
            "semi-condensed", "condensed", "extra-condensed", "ultra-condensed",
            "normal",
            "semi-expanded", "expanded", "extra-expanded", "ultra-expanded"
        ];
        this.style.fontStretch = stretches[font.width + 1]; // Lookup the CSS font stretch property
    }

    public qk_setTextColor(color: Color) { this.style.color = colorToCSS(color); }

    public qk_setLineCount(count: number) {
        // TODO: Implement
    }

    public qk_setLineBreakMode(mode: LineBreakMode) {
        // Get the CSS mode
        let cssMode: string;
        switch (mode) {
            case LineBreakMode.WordWrap:
                cssMode = "normal";
                break;
            case LineBreakMode.CharWrap:
                cssMode = "break-word";
                break;
            default:
                return;
        }

        // Set the property
        this.style.wordWrap = cssMode;
    }

    public qk_setAlignmentMode(mode: TextAlignmentMode) {
        // Get the CSS mode
        let cssMode: string;
        let cssFlexMode: string;
        switch (mode) {
            case TextAlignmentMode.Left:
                cssMode = "left";
                cssFlexMode = "flex-start";
                break;
            case TextAlignmentMode.Right:
                cssMode = "right";
                cssFlexMode = "flex-end";
                break;
            case TextAlignmentMode.Center:
                cssMode = "center";
                cssFlexMode = "center";
                break;
            case TextAlignmentMode.Justify:
                cssMode = "justify";
                cssFlexMode = "flex-start";
                break;
            default:
                return;
        }

        // Set the alignment
        this.style.textAlign = cssMode;
        this.style.justifyContent = cssFlexMode; // Uses flexbox to align left, center, and right
    }

    public qk_setVerticalAlignmentMode(mode: TextVerticalAlignmentMode) {
        // Get the CSS mode
        let cssMode: string;
        switch (mode) {
            case TextVerticalAlignmentMode.Top:
                cssMode = "flex-start";
                break;
            case TextVerticalAlignmentMode.Bottom:
                cssMode = "flex-end";
                break;
            case TextVerticalAlignmentMode.Center:
                cssMode = "center";
                break;
            default:
                return;
        }

        // Set the alignment
        this.style.alignItems = cssMode; // Uses flexbox to align at top, bottom, or middle
    }
}

// Register the element with the window
window.customElements.define("qk-label", QKLabel);
export function createLabelBacking(): LabelBacking { return new QKLabel(); }
