import { View, Rect, Color, Shadow } from "quark";

/* Element extension */
declare global {
    interface Element {
        view?: View;
        getOrCreateView(): View;
    }
}

Element.prototype.getOrCreateView = () => {
    if (this.view) {
        // Return existing view
        return this.view;
    } else {
        // Create a new view and save the backing
        this.view = new View();
        this.view.element = this;

        // Return the view
        return this.view;
    }
};

/* View extensions */
declare module "quark" {
    interface View {
        _element?: HTMLElement;
        element?: HTMLElement;
    }

    interface ViewConstructor {
        new(): View;
    }

    let View: ViewConstructor;

}

View.prototype.element = {
    get: function() {
        // Return the element
        return this._element as HTMLElement;
    },
    set: function(element: HTMLElement) {
        // Save the element
        this._element = element;

        // Configure the element
        element.style.position = "absolute";
    }
};

View.prototype.qk_init = function(createView: boolean) {
    if (createView)
        this.element = new HTMLElement();
};

View.prototype.qk_rect = function() { // TODO: Rect
    return new Rect(0, 0, 0, 0);
};
View.prototype.qk_setRect = function(rect: Rect) {

};

View.prototype.qk_subviews = function(): View[] {
    Array.prototype.slice.call(this.element.children)
        .map((child: HTMLElement) => { return child.getOrCreateView() });
};
View.prototype.qk_superview = function() { // TODO: What if no parent?
    return this.element.parentElement.getOrCreateView();
};
View.prototype.qk_addSubview = function(view: View, index: number) {
    // TODO: Subview
};
View.prototype.qk_removeFromSuperview = function() {
    this.element.parentElement.removeChild(this.element);
};

View.prototype.qk_isHidden = function() {
    return this.element.hidden;
};
View.prototype.qk_setHidden = function(hidden: boolean) {
    this.element.hidden = hidden;
};

View.prototype.qk_backgroundColor = function() { return new Color(0, 0, 0, 0); }; // TODO: BG color
View.prototype.qk_setBackgroundColor = function(color: Color) { };
View.prototype.qk_alpha = function() { return 0; }; // TODO: Alpha
View.prototype.qk_setAlpha = function(opacity: number) { };
View.prototype.qk_shadow = function() { return undefined; }; // TODO: Shadow
View.prototype.qk_setShadow = function(shadow: Shadow | undefined) { };
View.prototype.qk_cornerRadius = function() { return 0; }; // TODO: Corner radius
View.prototype.qk_setCornerRadius = function(radius: number) { };
