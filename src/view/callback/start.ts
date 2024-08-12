import { CallbackQuery } from "node-telegram-bot-api";
import { onStart } from "../command/start";

export const callbackStart = async (query: CallbackQuery, step: number) => {
    switch (query.data!.split('/')[step]){
        
        default:
            await onStart(query.message!);
    }

}