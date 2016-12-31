import { ImageView, ImageViewBacking, Image, ImageScalingMode } from "quark";
import { QKView } from "./QKView";
import { StringView } from "stringview.js";

export class QKImageView extends QKView implements ImageViewBacking {
    protected get qk_imageView(): ImageView { return this.qk_view as ImageView; }

    private imageElement: HTMLImageElement;

    public constructor() {
        super();
    }

    public qk_init() {
        // Create a child image
        this.imageElement = document.createElement("img");

        // Prevent being able to drag the image
        this.imageElement.draggable = false;

        // Fill the parent
        this.imageElement.style.width = "100%";
        this.imageElement.style.height = "100%";

        // Add as child
        this.appendChild(this.imageElement);
    }

    public qk_setImage(image: Image | undefined): void {
        if (image) {
            /*let start = Date.now();
            console.log("Started convert");
            let base64 = "data:" + image.mime + ";base64," + StringView.bytesToBase64(image.data);
            console.log("Finished converting", (Date.now() - start) / 1000);

            start = Date.now();
            console.log("Started setting");
            this.imageElement.src = base64;
            console.log("Finished setting", (Date.now() - start) / 1000);*/

            this.imageElement.src = "data:" + image.mime + ";base64," + StringView.bytesToBase64(image.data);
            this.imageElement.hidden = false;
        } else {
            this.imageElement.src = "";
            this.imageElement.hidden = true;
        }
    }

    public qk_setScalingMode(mode: ImageScalingMode): void {
        // TODO: Implement
    }
}

// Register the element with the window
window.customElements.define("qk-image-view", QKImageView);
export function createImageViewBacking(): ImageViewBacking { return new QKImageView(); }
