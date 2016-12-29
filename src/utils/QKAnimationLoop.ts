import { AnimationLoopBacking } from "quark";

let hooks: (() => void)[] = [];
let isAnimating = false; // If has started animating already
export function startAnimating(firstCall: boolean) { // firstCall is true if called from `QKInstance`
    // Don't add another run loop if is already animating
    if (firstCall && isAnimating) {
        return;
    }

    // Set animating if not already
    if (!isAnimating) {
        isAnimating = true;
    }

    // Call all of the hooks
    for (let hook of hooks) {
        hook();
    }

    // Request the next frame
    requestAnimationFrame(() => startAnimating(false));
}

export let QKAnimationLoop: AnimationLoopBacking = {
    qk_addHook(hook: () => void) {
        hooks.push(hook);
    },
    qk_removeHook(hook: () => void) {
        // Remove the hook if it exists
        let index = hooks.indexOf(hook);
        if (index > 0) {
            hooks.splice(index, 1);
        }
    }
};
