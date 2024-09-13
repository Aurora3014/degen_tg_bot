import TelegramBot from "node-telegram-bot-api";
import { botInstance } from "../../utils/bot";
import { createUser, getUser } from "../../model/user";
import { getSOlBalance } from "../../controller/token";

export const onStart = async (msg: TelegramBot.Message) => {
    const chatId = msg.chat.id;
    const user = await getUser(msg.chat.id!);
    if(!user){
        createUser(chatId);
    }
    const solBalance = await getSOlBalance(user?.publicKey!)
    await botInstance.sendMessage(msg.chat.id!,
        `Start Page\nWelcome to degen bot.${user ? `Your Address is <code>${user.publicKey}</code> \n(tap/click to copy)\n Balance: ${solBalance} SOL` : `You have no wallet for now. Create or import in Wallet page`}`, 
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {text:'Buy', callback_data: 'buy'},
                        {text:'Manage', callback_data: 'manage'}
                    ],
                    [
                        {text:'Sniper', callback_data: 'sniper'},
                    ],
                    [
                        {text:'Wallet', callback_data: 'wallet'},
                        {text:'Setting', callback_data: 'setting'}
                    ],

                    [
                        {text:'Refresh', callback_data: 'start'}
                    ],
                ]
            },
            parse_mode: 'HTML'
        }
    );
    return;
}