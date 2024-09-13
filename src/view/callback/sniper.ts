import { CallbackQuery } from "node-telegram-bot-api";
import { botInstance } from "../../utils/bot";
import { createNewWallet, importExistingWallet } from "../../controller/wallet";
import { getUser, getUserState, updateUserParams, updateUserState, updateUserWallet } from "../../model/user";
import { REPLY_MARKUP_BUTTON, USER_STATE } from "../../utils/constant";
import { eq } from "drizzle-orm";
import { db } from "../../utils/db";
import { orders, users } from "../../model/schema";
import { deleteLastMessage } from ".";


/**
    CallbackQuery "wallet/*"
*/
export const callbackSniper = async (query: CallbackQuery, step: number) => {
    const chatId = query.message?.chat.id!;
    const user = await getUser(chatId);
    switch (query.data!.split('/')[step]){

        case 'delete':
            const orderid = query.data!.split('/')[step+1];
            await db.delete(orders).where(eq(orders.id, +orderid))
        break;
        case 'delete_confirm':
            deleteLastMessage(query);

            botInstance.sendMessage(chatId, `Are you sure?`, {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {text:'Yes', callback_data: 'sniper/delete/' + query.data!.split('/')[step+1] },
                            {text:'No', callback_data: 'sniper'},
                        ],
                        [{text:'<< Back', callback_data: 'sniper'}]
                    ]
                }
            })
            break;
        case 'add':
            deleteLastMessage(query);
            await botInstance.sendMessage(chatId, `Enter the token Address to snipe`,{
                reply_markup: {
                    inline_keyboard: [
                        [{text:'<< Back', callback_data: 'sniper'}]
                    ]
                }
            })
            await updateUserState(chatId, USER_STATE.token_snipe);
        break;

        default:
            const result = await db.select().from(orders).innerJoin(users, eq(orders.chatId, users.chatId)).where(eq(orders.chatId, chatId));
            const buttons: REPLY_MARKUP_BUTTON[][] = [[
                {
                    text: 'Add new Address',
                    callback_data: 'sniper/add'
                }]
            ];
            result.map(order => {
                buttons.push([{
                    text: order.orders.value,
                    callback_data: `sniper/delete_confirm/${order.orders.id}`
                }])
            })
            buttons.push([{text:'<< Back', callback_data: 'start'}])
            
            botInstance.sendMessage(chatId, `Click button to delete token form sniping list`,{
                reply_markup: {
                    inline_keyboard: buttons
                }
            })
            
            
    } 

}