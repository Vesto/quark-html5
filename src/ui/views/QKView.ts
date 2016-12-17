import { View, ViewBacking, Rect, Color, Shadow } from "quark";

/* CSS Value extensions */
// TODO: Do the same for `Color`, figure out why these extensions aren't working
export interface CSSConvertible {
    toCSSValue(): string;
}

declare global {
    interface Number extends CSSConvertible {

    }
}

Number.prototype.toCSSValue = function() {
    return `${this.toString()}px`;
};

/* Element extension */
declare global {
    interface Element extends ViewBacking {

    }
}

/* View extensions */
export function alterElement() {
    Object.defineProperties(Element.prototype, {
        qk_getOrCreateView: {
            value: function () {
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
            value: function() {
                this.style.position = "absolute";
                this.style["user-select"] = "none"; // Prevent text selection
            }
        },

        qk_rect: {
            get: function () { // TODO: rect when not child (see how prototype.js did it)
                let clientRect = this.getBoundingClientRect();
                return new Rect(
                    clientRect.left, clientRect.top,
                    clientRect.width, clientRect.height
                );
            },
            set: function (rect: Rect) {
                this.style.left = rect.x.toCSSValue();
                this.style.top = rect.y.toCSSValue();
                this.style.width = rect.width.toCSSValue();
                this.style.height = rect.height.toCSSValue();
            }
        },

        qk_subviews: {
            value: function () {
                return Array.prototype.slice.call(this.children)
                    .map((child: HTMLElement) => {
                        return child.qk_getOrCreateView()
                    });
            }
        },
        qk_superview: {
            value: function () { // TODO: What if no parent?
                return this.parentElement.getOrCreateView();
            }
        },
        qk_addSubview: {
            value: function (view: View, index: number) { // TODO: Subviews
                this.appendChild(view.backing as Element)
            }
        },
        qk_removeFromSuperview: {
            value: function () {
                this.parentElement.removeChild(this.element);
            }
        },

        qk_isHidden: {
            get: function () {
                return this.hidden;
            },
            set: function (hidden: boolean) {
                this.hidden = hidden;
            }
        },
        qk_backgroundColor: {
            get: function () { // TODO: Background
                return new Color(0, 0, 0, 0);
            },
            set: function (color: Color) {
                this.style.backgroundColor = `rgba(${color.red * 255},${color.green * 255},${color.blue * 255},${color.alpha * 255})`;
            }
        },
        qk_alpha: {
            get: function () { // TODO: Alpha
                return 0;
            },
            set: function () {

            }
        },
        qk_shadow: {
            get: function () { // TODO: Shadow
                return undefined;
            },
            set: function (shadow: Shadow | undefined) {

            }
        },
        qk_cornerRadius: {
            get: function () { // TODO: Corner radius
                return 0;
            },
            set: function (value: number) {

            }
        }
    });

    View.backingInit = () => document.createElement("div");
}
