import { ImageViewBacking, Image, ImageScalingMode, ImageView, Point } from "quark";
import { QKView } from "./QKView";
import { StringView } from "stringview.js";

export class QKImageView extends QKView implements ImageViewBacking {
    protected get qk_imageView(): ImageView { return this.qk_view as ImageView; }

    public constructor() {
        super();

        // Don't repeat so it appears property when scaling
        this.style.backgroundRepeat = "no-repeat";
    }

    public qk_setImage(image: Image | undefined): void {
        if (image) {
            let start = Date.now();
            console.log("Started convert");
            let base64 = "data:" + image.mime + ";base64," + StringView.bytesToBase64(image.data);
            console.log("Finished converting", (Date.now() - start) / 1000);

            start = Date.now();
            console.log("Started setting");
            this.style.backgroundImage = `url(${base64})`;
            console.log("Finished setting", (Date.now() - start) / 1000);

            // this.style.backgroundImage = `url(${StringView.bytesToBase64(image.data)})`;
        } else {
            this.style.backgroundImage = "none";
        }
    }

    public qk_setScalingMode(mode: ImageScalingMode): void {
        // Set the size and position
        let size: string;
        if (typeof mode === "string") {
            switch (mode) {
                case "fill":
                    size = "100% 100%";
                    break;
                case "aspect-fit":
                    size = "contain";
                    break;
                case "aspect-fill":
                    size = "cover";
                    break;
                default:
                    return;
            }
        } else if (mode instanceof this.qk_lib.Size) {
            size = `${mode.width * 100}% ${mode.height * 100}%`;
        } else {
            return;
        }

        // Style the view
        this.style.backgroundSize = size;
    }

    public qk_setAlignment(alignment: Point): void {
        this.style.backgroundPosition = `${alignment.x * 100}% ${alignment.y * 100}%`;
    }
}

// Register the element with the window
window.customElements.define("qk-image-view", QKImageView);
export function createImageViewBacking(): ImageViewBacking { return new QKImageView(); }
