import { getUser, updateUserState } from "../../model/user";
import { botInstance } from "../../utils/bot";
import { USER_STATE } from "../../utils/constant";
// import { swapToken } from "../../controller/token/swap";


/**
    CallbackQuery "setting/*"
*/
export const callbackSetting = async (chatId: number, callBack: string, step: number) => {
    const user = await getUser(chatId);
    switch (callBack.split('/')[step]){
        case undefined:
            botInstance.sendMessage(chatId,
                `Settings Page\n\n` + 
                `Click button to change each settings.`,
                {
                    reply_markup:{
                        inline_keyboard: [
                            [
                                { text:'--- Buy Button Config ---', callback_data: 'setting/undefined'},
                            ],
                            [
                                { text: `Left: ${user?.buyOption1} SOL`, callback_data: `setting/buy/1` },
                                { text: `Right: ${user?.buyOption2} SOL`, callback_data: `setting/buy/2` },
                            ],
                            [
                                { text:'--- Sell Button Config ---', callback_data: 'setting/undefined' },
                            ],
                            [
                                { text: `Left: ${user?.sellOption1} %`, callback_data: `setting/sell/1` },
                                { text: `Right: ${user?.sellOption2} %`, callback_data: `setting/sell/2` },
                            ],
                            [
                                { text:'--- Slippage Config ---', callback_data: 'setting/undefined' },
                            ],
                            [
                                { text: `Buy: ${user?.buySlippage} %`, callback_data: `setting/buySlippage` },
                                { text: `Sell: ${user?.sellSlippage} %`, callback_data: `setting/sellSlippage` },
                            ],
                            [
                                { text:'<< Back', callback_data: 'start' },
                            ]
                        ]
                    }
                }
            )
            break;
        case 'buy':
        case 'sell':
            const optionCode = callBack!.split('/')[step + 1];
            if(callBack!.split('/')[step] == 'buy'){
                if(optionCode == '1'){
                    updateUserState(chatId, USER_STATE.buy_option_1)
                } else {
                    updateUserState(chatId, USER_STATE.buy_option_2)
                }
            } else {
                if(optionCode == '1'){
                    updateUserState(chatId, USER_STATE.sell_option_1)
                } else {
                    updateUserState(chatId, USER_STATE.sell_option_2)
                }
            }

            await botInstance.sendMessage(chatId,
                `Enter number to change setting.`
            )
            break;
        case 'buySlippage':
        case 'sellSlippage':
            if(callBack!.split('/')[step] == 'buySlippage')
                updateUserState(chatId, USER_STATE.buy_slippage);
            else 
                updateUserState(chatId, USER_STATE.sell_slippage);
            await botInstance.sendMessage(chatId,
                `Enter number to change setting.`
            )
            break
    }

}