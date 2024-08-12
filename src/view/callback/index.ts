import { botInstance } from "../../utils/bot"
import { callbackStart } from "./start";
import { callbackWallet } from "./wallet";

export const callbackView = () => {
    botInstance.on('callback_query', async (query) => {
        const chatId = query.message?.chat.id!
        const lastMessageId = query.message?.message_id!;
        botInstance.deleteMessage(chatId, lastMessageId);
        const step = 1
        switch(query.data!.split('/')[0]){
            case 'start':
                await callbackStart(query, step);
                break;
            case 'wallet':
                await callbackWallet(query, step);
                break;
            default: 
                await botInstance.sendMessage(query.message?.chat.id!, 'Oops. Unexpeceted CallbackQuery!');
        }
    })
}