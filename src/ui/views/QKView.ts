import { View, ViewBacking, Rect, Color, Shadow, InteractionEvent, KeyEvent, EventPhase, KeyPhase, ScrollEvent, Point, InteractionType, Vector } from "quark";

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
    return `rgba(${color.red * 255},${color.green * 255},${color.blue * 255},${color.alpha})`;
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

        // Event handlers
        _qk_handlePointerEvent(event: PointerEvent): void;
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
            console.log("init", this.qk_view);

            // Style the element
            this.style.position = "absolute";
            this.style.webkitUserSelect = "none"; // Prevent text selection

            // Prevent right click on this element
            this.oncontextmenu = event => event.preventDefault();

            // Handle pointer events (includes mice, touches, styluses)
            this.onpointerenter = this._qk_handlePointerEvent;
            this.onpointermove = this._qk_handlePointerEvent;
            this.onpointerout = this._qk_handlePointerEvent;

            this.onpointerdown = this._qk_handlePointerEvent;
            this.onpointerup = this._qk_handlePointerEvent;
            this.onpointercancel = this._qk_handlePointerEvent;

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
        value: function (this: HTMLElement) {
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
            let child = view.backing as HTMLElement;
            if (index >= this.children.length) {
                this.appendChild(child);
            } else {
                this.insertBefore(child, this.children[index]);
            }
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

    /* Event handling */
    _qk_handlePointerEvent: {
        value: function(this: HTMLElement, event: PointerEvent) {
            if (!this.qk_view) { return; }

            console.log("Pointer event");

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

            if (shouldCapture) { event.preventDefault(); }
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

            if (shouldCapture) { event.preventDefault(); }
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

            if (shouldCapture) { event.preventDefault(); }
        }
    }
});

View.backingInit = () => document.createElement("div");
