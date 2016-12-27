import { LoggerBacking } from "quark";

export let QKLogger: LoggerBacking = {
    qk_output(messages: any[]): void {
        console.log(messages.shift(), ...messages);
    }
};
