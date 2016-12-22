import { View, ViewBacking, Rect, Color, Shadow, InteractionEvent, KeyEvent, EventPhase, KeyPhase, ScrollEvent, Point, InteractionType, Vector } from "quark";
import elementResizeEvent = require("element-resize-event");

/*
https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
- Flag `capture` on all events and implement responder chain manually
- Or use `Event.stopPropegating` to stop it https://developer.mozilla.org/en-US/docs/Web/API/Event
- Maybe stopImmediatePropagation()?

 */

/* CSS Value extensions */
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

MouseEvent.prototype.convertToPoint = function(element: Element) {
    // let rect = element.getBoundingClientRect();
    // return new Point(this.pageX - rect.left, this.pageY - rect.top);
    return new Point(this.pageX, this.pageY);
};

function colorToCSS(color: Color): string {
    return `rgba(${Math.round(color.red * 255)},${Math.round(color.green * 255)},${Math.round(color.blue * 255)},${color.alpha})`;
}

/* Element extension */
declare global {
    interface HTMLElement extends ViewBacking {
        // Stored values
        // The `View` class sets the default values when initiated, so
        // these values are assured to be stored once created.
        _qk_rect: Rect;
        _qk_backgroundColor: Color;
        _qk_alpha: number;
        _qk_shadow?: Shadow;
        _qk_cornerRadius: number;

        // Layout handling
        _qk_resize(): void;
        _qk_layout(): void;

        // Input event handling
        _qk_isDragging: boolean; // If the pointer is dragging // TODO: Find out how to individually identify pointer events (id not working)
        _qk_pointerDown(event: PointerEvent): void; // Handles pointer down
        _qk_documentPointerMove(event: PointerEvent): void; // Handles pointer move globally
        _qk_documentPointerUp(event: PointerEvent): void; // Handles pointer up globally
        _qk_handlePointerEvent(event: PointerEvent): void; // Handles all other pointer events
        _qk_handleKeyEvent(event: KeyboardEvent): void;
        _qk_handleWheelEvent(event: WheelEvent): void;
    }
}

/* HTMLElement extensions */
Object.defineProperties(HTMLElement.prototype, {
    qk_getOrCreateView: {
        value: function (this: HTMLElement) {
            if (this.qk_view) {
                // Return existing view
                return this.qk_view;
            } else {
                // Create and return the new view
                this.qk_view = new View(this);
                return this.qk_view;
            }
        }
    },

    qk_init: {
        value: function(this: HTMLElement) {
            // Style the element
            this.style.position = "absolute";
            this.style.webkitUserSelect = "none"; // Prevent text selection
            this.style.overflow = "hidden"; // Clip the subviews

            // Resize event
            elementResizeEvent(this, this._qk_resize);

            // Prevent right click on this element
            this.oncontextmenu = event => event.preventDefault();

            // Handle pointer events (includes mice, touches, styluses) // See https://jsfiddle.net/jnL0xsa3/5/
            this._qk_isDragging = false;
            this.addEventListener("pointerenter", e => this._qk_handlePointerEvent(e));
            document.addEventListener("pointermove", e => this._qk_documentPointerMove(e));
            this.addEventListener("pointerout", e => this._qk_handlePointerEvent(e));

            this.addEventListener("pointerdown", e => this._qk_pointerDown(e));
            document.addEventListener("pointerup", e => this._qk_documentPointerUp(e));
            document.addEventListener("pointercancel", e => this._qk_documentPointerUp(e));

            // Handle key events
            this.onkeydown = this._qk_handleKeyEvent;
            this.onkeyup = this._qk_handleKeyEvent;

            // Handle wheel events
            this.onwheel = this._qk_handleWheelEvent;

            // TODO: Check that stored properties have values, otherwise do something
            // Will need to be read from CSS manually
        }
    },

    qk_rect: {
        get: function (this: HTMLElement) {
            // Return the saved rect or an empty one
            return this._qk_rect ? this._qk_rect : Rect.zero;
        },
        set: function (this: HTMLElement, rect: Rect) {
            // Save the Rect
            this._qk_rect = rect;

            // Set the style properties
            this.style.left = rect.x.toCSS();
            this.style.top = rect.y.toCSS();
            this.style.width = rect.width.toCSS();
            this.style.height = rect.height.toCSS();
        }
    },

    qk_subviews: {
        get: function (this: HTMLElement) {
            return Array.prototype.slice.call(this.children)
                .map((child: HTMLElement) => {
                    return child.qk_getOrCreateView();
                });
        }
    },
    qk_superview: {
        get: function (this: HTMLElement) {
            if (this.parentElement) {
                return this.parentElement.qk_getOrCreateView();
            } else {
                return undefined;
            }
        }
    },
    qk_addSubview: {
        value: function (this: HTMLElement, view: View, index: number) {
            // Add as child at proper index
            let child = view.backing as HTMLElement;
            if (index >= this.children.length) {
                this.appendChild(child);
            } else {
                this.insertBefore(child, this.children[index]);
            }

            // Trigger a layout on the view
            (view.backing as HTMLElement)._qk_layout();
        }
    },
    qk_removeFromSuperview: {
        value: function (this: HTMLElement) {
            if (this.parentElement) {
                this.parentElement.removeChild(this);
            }
        }
    },

    qk_isHidden: {
        get: function (this: HTMLElement) {
            return this.hidden;
        },
        set: function (this: HTMLElement, hidden: boolean) {
            this.hidden = hidden;
        }
    },
    qk_backgroundColor: {
        get: function (this: HTMLElement) {
            return this._qk_backgroundColor;
        },
        set: function (this: HTMLElement, color: Color) {
            this._qk_backgroundColor = color;
            this.style.backgroundColor = colorToCSS(color);
        }
    },
    qk_alpha: {
        get: function (this: HTMLElement) {
            return this._qk_alpha;
        },
        set: function (this: HTMLElement, value: number) {
            this._qk_alpha = value;
            this.style.opacity = value.toString();
        }
    },
    qk_shadow: {
        get: function (this: HTMLElement) {
            return this._qk_shadow;
        },
        set: function (this: HTMLElement, shadow: Shadow | undefined) {
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
    },
    qk_cornerRadius: {
        get: function (this: HTMLElement) {
            return this._qk_cornerRadius;
        },
        set: function (this: HTMLElement, value: number) {
            this._qk_cornerRadius = value;
            this.style.borderRadius = value.toCSS();
        }
    },

    /* Layout handling */
    _qk_resize: {
        value: function(this: HTMLElement) {
            // Set new _qk_rect
            this._qk_rect = new Rect(this.offsetLeft, this.offsetTop, this.offsetWidth, this.offsetHeight);

            // Layout
            this._qk_layout();
        }
    },
    _qk_layout: {
        value: function(this: HTMLElement) {
            if (!this.qk_view) { return; }

            // Layouts the view.
            this.qk_view.layout();
        }
    },

    /* Input event handling */
    _qk_pointerDown: {
        value: function(this: HTMLElement, event: PointerEvent) {
            // Save dragging
            this._qk_isDragging = true;

            // Handle event
            this._qk_handlePointerEvent(event);
        }
    },
    _qk_documentPointerMove: {
        value: function(this: HTMLElement, event: PointerEvent) {
            // Make sure dragging with right pointer
            if (!this._qk_isDragging) { return; }

            // Handle event
            this._qk_handlePointerEvent(event);
        }
    },
    _qk_documentPointerUp: {
        value: function(this: HTMLElement, event: PointerEvent) {
            // Make sure dragging with right pointer
            if (!this._qk_isDragging) { return; }

            // Stop dragging
            this._qk_isDragging = false;

            // Handle event
            this._qk_handlePointerEvent(event);

            // If pointer outside of element when pointer up, call `pointerout` event
            if (document.elementsFromPoint(event.pageX, event.pageY).indexOf(this) === -1) {
                let outEvent = new PointerEvent("pointerout", event);
                this._qk_handlePointerEvent(outEvent);
            }
        }
    },
    _qk_handlePointerEvent: {
        value: function(this: HTMLElement, event: PointerEvent) {
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

            // Don't send events if currently dragging, will send pointerout if needed when mouse up
            if (this._qk_isDragging && (event.type === "pointerenter" || event.type === "pointerout")) {
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
    },
    _qk_handleKeyEvent: {
        value: function(this: HTMLElement, event: KeyboardEvent) {
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
    },
    _qk_handleWheelEvent: {
        value: function(this: HTMLElement, event: WheelEvent) {
            if (!this.qk_view) { return; }

            let shouldCapture = this.qk_view.scrollEvent(
                new ScrollEvent(
                    event.timeStamp,
                    event,
                    event.convertToPoint(this), // TODO: location in root view
                    new Vector(event.wheelDeltaX, event.wheelDeltaY)
                )
            );

            if (shouldCapture) { event.preventDefault(); event.stopPropagation(); }
        }
    }
});

View.backingInit = () => document.createElement("div");
