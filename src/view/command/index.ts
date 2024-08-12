import { botInstance } from "../../utils/bot";
import { onStart } from "./start";

/**
 * Process command query ( ex: sth like '/start' '/order')
 * 
 * @param chatId - id to identify user 
 * @returns null
 * @throws Error if any item in the array has invalid data.
 */
export const commandView = () => {
    botInstance.onText(/\/start/, onStart);
    return;
}