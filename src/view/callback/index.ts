import { CallbackQuery } from "node-telegram-bot-api";
import { botInstance } from "../../utils/bot"
import { callbackBuy } from "./buy";
import { callbackManage } from "./manage";
import { callbackStart } from "./start";
import { callbackWallet } from "./wallet";
import { callbackSetting } from "./setting";
import { updateUserState } from "../../model/user";
import { USER_STATE } from "../../utils/constant";
import { callbackSniper } from "./sniper";

export const callbackView = () => {
    botInstance.on('callback_query', async (query) => {
        console.log(query.data)
        const step = 1
        const chatId = query.message?.chat.id!;
        await updateUserState(chatId, USER_STATE.idle);
        switch(query.data!.split('/')[0]){
            case 'start':
                deleteLastMessage(query)
                await callbackStart(query, step);
                break;
            case 'wallet':
                deleteLastMessage(query)
                await callbackWallet(query, step);
                break;
            case 'buy':
                deleteLastMessage(query)
                await callbackBuy(query, step);
                break;
            case 'manage':
                await callbackManage(query, step);
                break;
            case 'setting':
                await callbackSetting(+query.message?.chat.id!, query.data!, step);
                break
            case 'sniper':
                await callbackSniper(query, step);
                break;
            default: 
                await botInstance.sendMessage(query.message?.chat.id!, 'Oops. Unexpeceted CallbackQuery!');
        }
    })
}

export const deleteLastMessage = (query: CallbackQuery) => {
    const chatId = query.message?.chat.id!
    const lastMessageId = query.message?.message_id!;
    botInstance.deleteMessage(chatId, lastMessageId);
}