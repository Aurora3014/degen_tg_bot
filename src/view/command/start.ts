import TelegramBot from "node-telegram-bot-api";
import { botInstance } from "../../utils/bot";
import { createUser, getUser } from "../../model/user";

export const onStart = async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;
    const user = await getUser(msg.chat.id!);
    if(!user){
        createUser(chatId);
    }
    await botInstance.sendMessage(msg.chat.id!,`Start Page\nWelcome to degen bot.`, {
        reply_markup: {
            inline_keyboard: [
                [{text:'Wallet', callback_data: 'wallet'}]
            ]
        }
    });
    return;
}