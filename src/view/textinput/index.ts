import { CallbackQuery } from "node-telegram-bot-api";
import { isPublicKey } from "@metaplex-foundation/umi"
import { getPoolInfo, getTokenInfo } from "../../controller/token"
import { importExistingWallet } from "../../controller/wallet"
import { getUser, getUserState, updateUser, updateUserParams, updateUserState, updateUserWallet } from "../../model/user"
import { initRayidumInstance } from "../../utils/amm"
import { botInstance } from "../../utils/bot"
import { USER_STATE } from "../../utils/constant"
import { db } from "../../utils/db"
import { users } from "../../model/schema"
import { callbackSetting } from "../callback/setting"



export const inputView = () => {
    botInstance.on('text', async (msg) => {
        if(msg.text![0] == '/') return;
        const step = 1
        const chatId = msg.chat.id;
        const user = await getUser(chatId)
        if(!user) return;
        switch(user!.state){
            case USER_STATE.idle:
                break;
            case USER_STATE.wallet_import:
                console.log('here')
                const keypair = importExistingWallet(msg.text!)
                if(await updateUserWallet(chatId, keypair))
                    await botInstance.sendMessage(chatId, 'Wallet Import Successful!', {
                        reply_markup: {
                            inline_keyboard: [
                                [{text:'<< Back', callback_data: 'wallet'}]
                            ]
                        }
                    });
                else 
                    await botInstance.sendMessage(chatId, 'Wallet Import failed. Contact with support team')
                // no more input after this
                await updateUserState(chatId, USER_STATE.idle);

                break;
            case USER_STATE.buy_newbuy:
                console.log('new buy text input')
                const address = msg.text!;
                if(!isPublicKey(address)) {
                    await botInstance.sendMessage(
                        chatId,
                        'Invalid Address. Enter again.',
                    );
                    break;
                }
                const tokenInfo = await getTokenInfo(address);
                const user = await getUser(chatId)
                const owner = importExistingWallet( user!.secretKey! )
                const raydium = await initRayidumInstance( owner)
                const poolInfo = await getPoolInfo( owner, address )
                const res = await raydium.liquidity.getRpcPoolInfos([])
                await updateUserParams(chatId, address);
                botInstance.sendMessage(
                    chatId,
                    `${tokenInfo.content.metadata.name} | $${tokenInfo.content.metadata.name}\n` + 
                    `<code>${address}</code>\n` + 
                    `Price: $${tokenInfo.token_info.price_info.price_per_token}\n`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{text:'<< Back', callback_data: 'start'}],
                                [
                                    {text:'Buy 1.0 SOL', callback_data: 'buy/option1'},
                                    {text:'Buy 2.0 SOL', callback_data: 'buy/option2'},
                                    {text:'Buy X SOL', callback_data: 'buy/optionx'}
                                ]
                            ]
                        },
                        parse_mode: 'HTML'
                    }
                )
                await updateUserState(chatId, USER_STATE.idle);
                
                break;
            case USER_STATE.buy_option_1:
                if(isNaN(+msg.text!)){
                    botInstance.sendMessage(chatId, 
                        `Invalid value, Please enter again.`
                    )
                    break;
                }
                await db.update(users).set({
                    buyOption1: +msg.text!
                })
                await updateUserState(chatId, USER_STATE.idle);
                await callbackSetting(chatId, 'setting', 1)
                break;
            case USER_STATE.buy_option_2:
                if(isNaN(+msg.text!)){
                    botInstance.sendMessage(chatId, 
                        `Invalid value, Please enter again.`
                    )
                    break;
                }
                await db.update(users).set({
                    buyOption2: +msg.text!
                })
                await updateUserState(chatId, USER_STATE.idle);
                await callbackSetting(chatId, 'setting', 1)
                break;
            case USER_STATE.sell_option_1:
                if(isNaN(+msg.text!)){
                    botInstance.sendMessage(chatId, 
                        `Invalid value, Please enter again.`
                    )
                    break;
                }
                await db.update(users).set({
                    sellOption1: +msg.text!
                })
                await updateUserState(chatId, USER_STATE.idle);
                await callbackSetting(chatId, 'setting', 1)
                break;
            case USER_STATE.sell_option_2:
                if(isNaN(+msg.text!)){
                    botInstance.sendMessage(chatId, 
                        `Invalid value, Please enter again.`
                    )
                    break;
                }
                await db.update(users).set({
                    sellOption2: +msg.text!
                })
                await updateUserState(chatId, USER_STATE.idle);
                await callbackSetting(chatId, 'setting', 1)
                break;
            case USER_STATE.buy_slippage:
                if(isNaN(+msg.text!)){
                    botInstance.sendMessage(chatId, 
                        `Invalid value, Please enter again.`
                    )
                    break;
                }
                await db.update(users).set({
                    buySlippage: +msg.text!
                })
                await updateUserState(chatId, USER_STATE.idle);
                await callbackSetting(chatId, 'setting', 1)
                break;
            case USER_STATE.sell_slippage:
                if(isNaN(+msg.text!)){
                    botInstance.sendMessage(chatId, 
                        `Invalid value, Please enter again.`
                    )
                    break;
                }
                await db.update(users).set({
                    sellSlippage: +msg.text!
                })
                await updateUserState(chatId, USER_STATE.idle);
                await callbackSetting(chatId, 'setting', 1)
                break;
            default: 
                await botInstance.sendMessage(chatId, 'Oops. Unexpeceted Input!', {
                    reply_markup: {
                        inline_keyboard: [
                            [{text:'<< Back', callback_data: 'start'}]
                        ]
                    }
                });
        }
    })
}