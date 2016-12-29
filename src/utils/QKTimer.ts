import { TimerBacking } from "quark";

export let QKTimer: TimerBacking = {
    qk_executeAfter(milliseconds: number, callback: () => void) {
        // Set a timeout to call the callback
        let timeoutHandle = setTimeout(
            () => {
                callback();
            },
            milliseconds
        );

        // Return a function to cancel the timeout if needed
        return () => {
            clearTimeout(timeoutHandle);
        };
    }
};
