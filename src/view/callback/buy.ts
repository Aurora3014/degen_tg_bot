import { CallbackQuery } from "node-telegram-bot-api";
import { getUser, updateUserState } from "../../model/user";
import { botInstance } from "../../utils/bot";
import { getTokensOfUser } from "../../model/token";
import { REPLY_MARKUP_BUTTON, USER_STATE } from "../../utils/constant";
import { swapJupiter } from "../../controller/token/swap";
// import { swapToken } from "../../controller/token/swap";


/**
    CallbackQuery "wallet/*"
*/
export const callbackBuy = async (query: CallbackQuery, step: number) => {
    const chatId = query.message?.chat.id!;
    const user = await getUser(chatId);
    switch (query.data!.split('/')[step]){
        case 'option1':

            await swapJupiter(chatId, user?.params!, +user?.buyOption1!, true, true)
            break;
        case 'option2':

            await swapJupiter(chatId, user?.params!, +user?.buyOption2!, true, true)
            break;
        default:
            let keyboards: REPLY_MARKUP_BUTTON[][] = [[]];
            await updateUserState(chatId, USER_STATE.buy_newbuy);
            // const userTokens = await getTokensOfUser(chatId);

            // userTokens.map(async (userToken) => {
            //     keyboards.push([{
            //         text: '$' + userToken.tokens.name,
            //         callback_data: `manage/token/${userToken.tokens.address}`
            //     }])
            // })

            keyboards.push([{
                text: '<< Back',
                callback_data: 'start'
            }])
            
            await botInstance.sendMessage(
                chatId, `Enter new token address to buy token`, {
                reply_markup: {
                    inline_keyboard: keyboards                    
                }
            });
            
            // if(!userTokens.length){
            //     await botInstance.sendMessage(
            //         chatId,
            //         `You have no Token Positions now`
            //     )
            // }
    }

}