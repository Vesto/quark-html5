import { Logger } from "quark";

Logger.qk_output = function(messages: any[]): void {
    console.log(messages.shift(), ...messages);
};
