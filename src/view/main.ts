import { callbackView } from "./callback";
import { commandView } from "./command";
import { inputView } from "./textinput";

export const view = () => {
    callbackView();
    commandView();
    inputView();
}
 