import { View, ViewBacking, Rect, Color, Shadow } from "quark";

/* CSS Value extensions */
// TODO: Figure out why extensions aren't working for `quark`
// TODO: Need to extend `Color` for CSS
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

function colorToCSS(color: Color): string {
    return `rgba(${color.red * 255},${color.green * 255},${color.blue * 255},${color.alpha})`
}

/* Element extension */
declare global {
    interface HTMLElement extends ViewBacking {
        // Stored values (don't read directly from CSS). The `View` class sets the default values when initiated, so
        // these values are assured to be stored once created.
        _qk_rect: Rect;
        _qk_backgroundColor: Color;
        _qk_alpha: number;
        _qk_shadow?: Shadow;
        _qk_cornerRadius: number;
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
                    return child.qk_getOrCreateView()
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
                    colorToCSS(shadow.color)
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
    }
});

View.backingInit = () => document.createElement("div");
