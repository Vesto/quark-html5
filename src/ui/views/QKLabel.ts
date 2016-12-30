import { LabelBacking, Font, Color, LineBreakMode, TextAlignmentMode, TextVerticalAlignmentMode } from "quark";
import { colorToCSS, QKView } from "./QKView";

export class QKLabel extends QKView implements LabelBacking {
    public constructor() {
        super();

        // Set to table-cell display so vertical center alignment works with multiple lines
        this.style.display = "table-cell";
    }

    get qk_text(): string { return this.textContent ? this.textContent : ""; }
    set qk_text(text: string) { this.textContent = text; }

    private _qk_font: Font;
    public get qk_font(): Font { return this._qk_font; }
    public set qk_font(font: Font) {
        // Save the font
        this._qk_font = font;

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

    private _qk_textColor: Color;
    public get qk_textColor(): Color { return this._qk_textColor; }
    public set qk_textColor(color: Color) {
        this._qk_textColor = color;
        this.style.color = colorToCSS(color);
    }

    public qk_lineCount: number; // TODO: Implement

    private _qk_lineBreakMode: LineBreakMode;
    public get qk_lineBreakMode(): LineBreakMode { return this._qk_lineBreakMode; }
    public set qk_lineBreakMode(mode: LineBreakMode) {
        // Save the mode
        this._qk_lineBreakMode = mode;

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

    private _qk_alignmentMode: TextAlignmentMode;
    get qk_alignmentMode(): TextAlignmentMode { return this._qk_alignmentMode; }
    set qk_alignmentMode(mode: TextAlignmentMode) {
        // Save the mode
        this._qk_alignmentMode = mode;

        // Get the CSS mode
        let cssMode: string;
        switch (mode) {
            case TextAlignmentMode.Left:
                cssMode = "left";
                break;
            case TextAlignmentMode.Right:
                cssMode = "right";
                break;
            case TextAlignmentMode.Center:
                cssMode = "center";
                break;
            case TextAlignmentMode.Justify:
                cssMode = "justify";
                break;
            default:
                return;
        }

        // Set the alignment
        this.style.textAlign = cssMode;
    }

    private _qk_verticalAlignmentMode: TextVerticalAlignmentMode;
    get qk_verticalAlignmentMode(): TextVerticalAlignmentMode { return this._qk_verticalAlignmentMode; }
    set qk_verticalAlignmentMode(mode: TextVerticalAlignmentMode) {
        // Save the mode
        this._qk_verticalAlignmentMode = mode;

        // Get the CSS mode
        let cssMode: string;
        switch (mode) {
            case TextVerticalAlignmentMode.Top:
                cssMode = "top";
                break;
            case TextVerticalAlignmentMode.Bottom:
                cssMode = "bottom";
                break;
            case TextVerticalAlignmentMode.Middle:
                cssMode = "middle";
                break;
            default:
                return;
        }

        // Set the alignment
        this.style.verticalAlign = cssMode;
    }
}

// Register the element with the window
window.customElements.define("qk-label", QKLabel);
export function createLabelBacking(): LabelBacking { return new QKLabel(); }