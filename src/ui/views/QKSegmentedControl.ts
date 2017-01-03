import { SegmentedControl, SegmentedControlBacking, Button, Appearance, SegmentItem, View } from "quark";
import { QKView } from "./QKView";
import { QKButton } from "./QKButton";

export class QKSegmentedControl extends QKView implements SegmentedControlBacking {
    protected get qk_segmentedControl(): SegmentedControl { return this.qk_view as SegmentedControl; }

    private totalSegmentWidth: number = 0; // All SegmentItem.width added up
    private segmentButtons: Button[] = [];
    private separators: View[] = [];

    public constructor() {
        super();
    }

    public qk_appearanceChanged(appearance: Appearance) {
        super.qk_appearanceChanged(appearance);

        // Style this view
        this.qk_view.cornerRadius = appearance.cornerRadius;
        this.qk_view.backgroundColor = appearance.secondaryColor;

        // Restyle all the segments
        this.restyleSegments();
    }

    protected _qk_layout() {
        super._qk_layout();

        // Layout all the segments and separators
        let xShift = 0;
        for (let i = 0; i < this.segmentButtons.length; i++) {
            let segment = this.segmentButtons[i];

            /* Segments */
            // Resize the view to the appropriate percentage
            let segmentWidth = this.qk_view.rect.width * this.qk_segmentedControl.segments[i].width / this.totalSegmentWidth;
            segment.rect = new this.qk_lib.Rect(
                xShift, 0,
                segmentWidth, this.qk_view.rect.height
            );

            // Add to the x shift for the next element
            xShift += segmentWidth;

            /* Separators */
            if (i < this.segmentButtons.length - 1) { // Don't modify the last separator, since it doesn't exist
                let separator = this.separators[i];

                // Position the view
                let padding = 8;
                let width = 1;
                separator.rect = new this.qk_lib.Rect(
                    xShift - width / 2, padding,
                    width, this.qk_view.rect.height - padding * 2
                );

                // Round the corners
                separator.cornerRadius = width / 2;
            }
        }
    }

    public qk_setIsEnabled(enabled: boolean): void {
        // TODO: This
    }

    public qk_setSegments(segments: SegmentItem[]): void {
        // Clear previous segments
        this.clearSegments();

        /* Segments */
        for (let i = 0; i < segments.length; i++) {
            let segment = segments[i];
            // Create the button
            let button = new this.qk_lib.Button(new QKSegmentView()) as Button;
            button.onButtonUp = () => {
                this.qk_segmentedControl.selectedIndex = i;
            };

            // Set enabled
            button.isEnabled = segment.isEnabled;

            // Configure the button
            if (typeof segment.content === "string") {
                button.title = segment.content;
            } else if (segment.content instanceof this.qk_lib.Image) {
                button.title = "Image";
            }

            // Add the width
            this.totalSegmentWidth += segment.width;

            // Add to view
            this.qk_view.addSubview(button);

            // Add it
            this.segmentButtons.push(button);
        }

        /* Separators */
        // Do this loop separately so the separators appear on top of the segments
        for (let i = 0; i < segments.length - 1; i++) {
            // Create the separator
            let separator = new this.qk_lib.View();

            // Add to view
            this.qk_view.addSubview(separator);

            // Add it
            this.separators.push(separator);
        }

        // Layout the views
        this._qk_layout();
    }

    public qk_setSelectedIndex(index: number | any): void {
        this.restyleSegments();
    }

    private clearSegments(): void {
        for (let segment of this.segmentButtons) {
            // Remove from the superview
            segment.removeFromSuperview();

            // Remove the callbacks
            segment.onButtonDown = undefined;
            segment.onButtonUp = undefined;
        }

        for (let separator of this.separators) {
            // Remove from the superview
            separator.removeFromSuperview();
        }

        // Empty the array
        this.totalSegmentWidth = 0;
        this.segmentButtons = [];
        this.separators = [];
    }

    private restyleSegments(): void {
        // All the buttons already have the appropriate style since they are a subview of this view, and when the
        // appearance is changed for this view, it was set for them.
        for (let i = 0; i < this.segmentButtons.length; i++) {
            let segment = this.segmentButtons[i];

            // Set if emphasized
            segment.isEmphasized = i === this.qk_segmentedControl.selectedIndex;

            // Remove corner radius
            segment.cornerRadius = 0;
        }

        for (let i = 0; i < this.separators.length; i++) {
            let separator = this.separators[i];

            // Match the background color; use `this.qk_view.appearance` instead of `separator.appearance` because
            // the separator's appearance has not been set yet at this stage.
            separator.backgroundColor = this.qk_view.appearance.backgroundColor;

            // Hide if on border of selected index
            let selectedIndex = this.qk_segmentedControl.selectedIndex;
            separator.isHidden = i === selectedIndex || i + 1 === selectedIndex;
        }
    }
}

// Override QKButton behavior to act like a segment
class QKSegmentView extends QKButton {
    protected restyleButton(): void {
        super.restyleButton();

        // Don't add a corner radius
        this.qk_view.cornerRadius = 0;
    }
}

// Register the segment view
window.customElements.define("qk-segment-view", QKSegmentView);

// Register the element with the window
window.customElements.define("qk-segmented-control", QKSegmentedControl);
export function createSegmentedControlBacking(): SegmentedControlBacking { return new QKSegmentedControl(); }
