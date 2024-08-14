import { CallbackQuery } from "node-telegram-bot-api";
import { getUser, updateUserState } from "../../model/user";
import { botInstance } from "../../utils/bot";
import { getTokenOfUser } from "../../model/token";
import { USER_STATE } from "../../utils/constant";
import { L } from "@raydium-io/raydium-sdk-v2/lib/raydium-2dba3573";


/**
    CallbackQuery "wallet/*"
*/
export const callbackBuy = async (query: CallbackQuery, step: number) => {
    const chatId = query.message?.chat.id!;
    const user = await getUser(chatId);
    switch (query.data!.split('/')[step]){
        case 'option1':
            const amount = user!.buyOption1;
            
            break;
        default:
            await botInstance.sendMessage(chatId,`Reply Token Info or Enter new token address`,{
                reply_markup: {
                    inline_keyboard: [
                        [{text:'<< Back', callback_data: 'start'}]
                    ]
                }
            });
            await updateUserState(chatId, USER_STATE.buy_newbuy);
            const userTokens = await getTokenOfUser(chatId);
            userTokens.length ? 
            userTokens.map(async (userToken) => {
                await botInstance.sendMessage(
                    chatId,
                    `name: ${userToken.tokens.name}\n symbol: ${userToken.tokens.symbol}`
                )
            }) : await botInstance.sendMessage(
                chatId,
                `You have no Token Positions now`
            )
    }

}