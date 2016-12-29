import { View, ViewBacking, Rect, Color, Shadow, InteractionEvent, KeyEvent, EventPhase, KeyPhase, ScrollEvent, Point, InteractionType } from "quark";
import { QKInstance } from "../../core/QKInstance";

// Declare the ResizeObserver for getting resize events (part of experimental Chrome)
declare global {
    class ResizeObserver {
        constructor(callback: Function)
        public observe(element: HTMLElement): void;
    }
}

declare global {
    interface Number {
        toCSS(): string;
    }

    interface NumberConstructor {
        fromCSS(value: string): number;
    }

    interface String {
        // Returns a list of all
        parseNumbers(): number[];
    }

    interface Window {
        customElements: {
            define(name: string, object: any): void;
        };
    }

    interface MouseEvent {
        convertToPoint(element: HTMLElement): Point;
    }
}

Number.prototype.toCSS = function() {
    return `${this.toString()}px`;
};

Number.fromCSS = function(value: string) {
    return parseFloat(value);
};

String.prototype.parseNumbers = function() {
    let regex = /[+-]?\d+(\.\d+)?/g;
    let matches = this.match(regex);
    if (matches) {
        return matches.map((v: string) => parseFloat(v));
    } else {
        return [];
    }
};

MouseEvent.prototype.convertToPoint = function(qkView: QKView) {
    let view = qkView.qk_view;
    if (!view) { console.log("No view"); return Point.zero; }
    let window = view.module.window;
    if (!window) { console.log("No window"); return Point.zero; }
    let rect = (window.rootView.backing as QKView).getBoundingClientRect();
    return new qkView.qk_lib.Point(this.pageX - rect.left, this.pageY - rect.top);
};

export function colorToCSS(color: Color): string {
    return `rgba(${Math.round(color.red * 255)},${Math.round(color.green * 255)},${Math.round(color.blue * 255)},${color.alpha})`;
}

/* Element extension */
export class QKView extends HTMLElement implements ViewBacking {
    // View
    public qk_view?: View;

    // Initialization
    public constructor() {
        super();

        // Position the element absolutely
        this.style.position = "absolute";

        // Don't allow the user to select text
        this.style.webkitUserSelect = "none";

        // Don't show any custom cursors
        this.style.cursor = "default";

        /* Event handling */
        // Resize event
        new ResizeObserver(() => this._qk_resize()).observe(this);

        // Prevent right click on this element
        this.oncontextmenu = event => event.preventDefault();

        // Handle pointer events (includes mice, touches, styluses) // See https://jsfiddle.net/jnL0xsa3/5/
        this._qk_isDragging = false;
        this.addEventListener("pointerenter", e => this._qk_handlePointerEvent(e));
        this.addEventListener("pointerout", e => this._qk_handlePointerEvent(e));

        this.addEventListener("pointerdown", e => this._qk_pointerDown(e));

        this._qk_pointerMoveEvent = (e) => this._qk_pointerMove(e);
        this._qk_pointerUpEvent = (e) => this._qk_pointerUp(e);

        this._qk_setDragging(false); // Registers proper events

        // Handle key events
        this.addEventListener("keydown", e => this._qk_handleKeyEvent(e));
        this.addEventListener("keyup", e => this._qk_handleKeyEvent(e));

        // Handle wheel events
        this.addEventListener("wheel", e => this._qk_handleWheelEvent(e));
    }

    public qk_init() {
        // Nothing to do
    }

    /* Layout */
    private _qk_rect: Rect = Rect.zero;
    get qk_rect(): Rect { return this._qk_rect; }
    set qk_rect(rect: Rect) {
        // console.log("Set qkrect", this);
        // Save the Rect
        this._qk_rect = rect;

        // Set the style properties
        this.style.left = rect.x.toCSS();
        this.style.top = rect.y.toCSS();
        this.style.width = rect.width.toCSS();
        this.style.height = rect.height.toCSS();
    }

    /* View Hierarchy */
    public get qk_subviews(): View[] {
        return Array.prototype.slice.call(this.children)
            .map((child: QKView) => child.qk_view)
            .filter((child?: View) => typeof child !== "undefined");
    }

    public get qk_superview(): View | undefined {
        if (!this.qk_view) { return undefined; }

        if (this.parentElement instanceof QKView) {
            return this.parentElement.qk_view;
        } else {
            return undefined;
        }
    }

    public qk_addSubview(view: View, index: number): void {
        // Remove from previous superview if needed
        if (view.superview) {
            view.removeFromSuperview();
        }

        // Add as child at proper index
        let child = view.backing as QKView;
        if (index >= this.children.length) {
            this.appendChild(child);
        } else {
            this.insertBefore(child, this.children[index]);
        }

        // Notify the child
        view.movedToSuperview(this.qk_view);

        // Trigger a layout on the view
        (view.backing as QKView)._qk_layout();
    }

    public qk_removeFromSuperview(): void {
        if (!this.qk_view) { return; }

        // Remove from the parent
        if (this.parentElement) {
            this.parentElement.removeChild(this);
        }

        // Notify the view
        this.qk_view.movedToSuperview(undefined);
    }

    /* Visibility */
    public get qk_isHidden(): boolean { return this.hidden; }
    public set qk_isHidden(hidden: boolean) { this.hidden = hidden; }

    private _qk_clipSubviews: boolean;
    public get qk_clipSubviews(): boolean { return this._qk_clipSubviews; }
    public set qk_clipSubviews(clip: boolean) {
        this._qk_clipSubviews = clip;
        this.style.overflow = clip ? "hidden" : "visible";
    }

    /* Style */
    private _qk_backgroundColor: Color;
    public get qk_backgroundColor(): Color { return this._qk_backgroundColor; }
    public set qk_backgroundColor(color: Color) {
        this._qk_backgroundColor = color;
        this.style.backgroundColor = colorToCSS(color);
    }

    private _qk_alpha: number;
    public get qk_alpha(): number { return this._qk_alpha; }
    public set qk_alpha(alpha: number) {
        this._qk_alpha = alpha;
        this.style.opacity = alpha.toString();
    }

    private _qk_shadow?: Shadow;
    public get qk_shadow(): Shadow | undefined { return this._qk_shadow; }
    public set qk_shadow(shadow: Shadow | undefined) {
        this._qk_shadow = shadow;
        if (shadow) {
            this.style.boxShadow =
                shadow.offset.x.toCSS() + " " +
                shadow.offset.y.toCSS() + " " +
                shadow.blurRadius.toCSS() + " " +
                colorToCSS(shadow.color);
        } else {
            this.style.boxShadow = "none";
        }
    }

    private _qk_cornerRadius: number;
    public get qk_cornerRadius(): number { return this._qk_cornerRadius; }
    public set qk_cornerRadius(radius: number) {
        this._qk_cornerRadius = radius;
        this.style.borderRadius = radius.toCSS();
    }

    /* VM interface */
    public get qk_lib(): any {
        return this.qk_instance.quarkLibrary;
    }

    public get qk_instance(): QKInstance {
        if (!this.qk_view) { throw new Error("Attempting to access `QKInstance` for element with no `qk_view`."); }
        return this.qk_view.module.backing as QKInstance;
    }

    /* Layout Handling */
    protected _qk_resize() {
        // Save new _qk_rect
        this._qk_rect = new this.qk_lib.Rect(this.offsetLeft, this.offsetTop, this.offsetWidth, this.offsetHeight);

        // Layout
        this._qk_layout();
    }

    protected _qk_layout() {
        if (!this.qk_view) { return; }

        // Layouts the view.
        this.qk_view.layout();
    }

    /* Input Event Handling */
    // Events (stored here so they can be cancelled or reused)
    private _qk_pointerMoveEvent: (e: PointerEvent) => void;
    private _qk_pointerUpEvent: (e: PointerEvent) => void;

    // Use this so when `pointerup` is called, we can determine which button was let up
    private _qk_previousInteractionType: InteractionType;

    // If the pointer is dragging // TODO: Find out how to individually identify pointer events (pointer.id not working)
    private _qk_isDragging: boolean;

    private _qk_setDragging(dragging: boolean) {
        // Make sure there's a change
        if (dragging === this._qk_isDragging) { return; }

        // Save events
        this._qk_isDragging = dragging;

        // Register proper events
        if (dragging) {
            // Remove local events
            this.removeEventListener("pointermove", this._qk_pointerMoveEvent);

            // Add document events
            document.addEventListener("pointermove", this._qk_pointerMoveEvent);
            document.addEventListener("pointerup", this._qk_pointerUpEvent);
            document.addEventListener("pointercancel", this._qk_pointerUpEvent);
        } else {
            // Add local events
            this.addEventListener("pointermove", this._qk_pointerMoveEvent);

            // Remove global events
            document.removeEventListener("pointermove", this._qk_pointerMoveEvent);
            document.removeEventListener("pointerup", this._qk_pointerUpEvent);
            document.removeEventListener("pointercancel", this._qk_pointerUpEvent);
        }
    }

    private _qk_pointerDown(event: PointerEvent) {
        // Save dragging
        this._qk_setDragging(true);

        // Handle event
        this._qk_handlePointerEvent(event);
    }

    private _qk_pointerMove(event: PointerEvent) {
        // Handle event
        this._qk_handlePointerEvent(event);
    }

    private _qk_pointerUp(event: PointerEvent) {
        // Make sure dragging with right pointer
        if (!this._qk_isDragging) { return; }

        // Handle event
        this._qk_handlePointerEvent(event);

        // Stop dragging
        this._qk_setDragging(false);

        // If pointer outside of element when pointer up, call `pointerout` event
        if (document.elementsFromPoint(event.pageX, event.pageY).indexOf(this) === -1) {
            let outEvent = new PointerEvent("pointerout", event);
            this._qk_handlePointerEvent(outEvent);
        }
    }

    private _qk_handlePointerEvent(event: PointerEvent) {
        if (!this.qk_view) { return; }

        // Determine the phase
        let phase: EventPhase;
        switch (event.type) {
            case "pointerenter":
            case "pointerdown":
                phase = EventPhase.Began;
                break;
            case "pointermove":
                phase = EventPhase.Changed;
                break;
            case "pointerup":
            case "pointerout":
                phase = EventPhase.Ended;
                break;
            case "pointercancel":
                phase = EventPhase.Cancelled;
                break;
            default:
                // TODO: Log unhandled event
                return;
        }

        // Determine the interaction type
        let type: InteractionType;
        switch (event.pointerType) {
            case "touch":
                type = InteractionType.Touch;
                break;
            case "pen":
                type = InteractionType.Stylus;
                break;
            case "mouse":
                // Test for each button individually. See `MouseEvent.buttons`.
                // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
                if (event.buttons === 0) {
                    type = InteractionType.Hover;
                } else if (event.buttons & 0b001) {
                    type = InteractionType.LeftMouse;
                } else if (event.buttons & 0b010) {
                    type = InteractionType.RightMouse;
                } else if (event.buttons & 0b100) {
                    type = InteractionType.MiddleMouse;
                } else {
                    type = InteractionType.OtherMouse;
                }
                break;
            default:
                // TODO: Log unhandled
                return;
        }

        // Override phase if the pointer is released. `pointerup` tells us there's no buttons down (hovering), we
        // need to look at the previous interaction type to see.
        if (this._qk_previousInteractionType && (event.type === "pointerup" || event.type === "pointercancel")) {
            type = this._qk_previousInteractionType;
        }

        // Save the previous interaction type for the next event.
        this._qk_previousInteractionType = type;

        // Don't send events if currently dragging, will send pointerout if needed when mouse up
        if (this._qk_isDragging && (event.type === "pointerenter" || event.type === "pointerout")) {
            return;
        }

        // Don't send events if is not dragging but is a hover. This way, if an element below another element is
        // dragged below the element above it, the element above it will not capture events.
        if (!this._qk_isDragging && type !== InteractionType.Hover) {
            return;
        }

        let shouldCapture = this.qk_view.interactionEvent(
            new InteractionEvent(
                event.timeStamp,
                event,
                type,
                phase,
                event.convertToPoint(this), // TODO: Location in view
                event.detail,
                event.pointerId,
                event.pressure
            )
        );

        if (shouldCapture) { event.preventDefault(); event.stopPropagation(); }
    }

    private _qk_handleKeyEvent(event: KeyboardEvent) {
        if (!this.qk_view) { return; }

        let isDown = event.type !== "keyup"; // Look at the event type to determine if it's down

        let shouldCapture = this.qk_view.keyEvent(
            new KeyEvent(
                event.timeStamp,
                event,
                isDown ? (event.repeat ? KeyPhase.Repeat : KeyPhase.Down) : KeyPhase.Up,
                event.keyCode,
                [] // TODO: mods
            )
        );

        if (shouldCapture) { event.preventDefault(); event.stopPropagation(); }
    }

    private _qk_handleWheelEvent(event: WheelEvent) {
        if (!this.qk_view) { return; }

        let shouldCapture = this.qk_view.scrollEvent(
            new ScrollEvent(
                event.timeStamp,
                event,
                event.convertToPoint(this), // TODO: location in root view
                new this.qk_lib.Vector(event.wheelDeltaX, event.wheelDeltaY)
            )
        );

        if (shouldCapture) { event.preventDefault(); event.stopPropagation(); }
    }
}

// Register the element with the window
window.customElements.define("qk-view", QKView);
export function createViewBacking(): ViewBacking { return new QKView(); }
