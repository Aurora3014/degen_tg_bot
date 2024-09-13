import { CallbackQuery } from "node-telegram-bot-api";
import { isPublicKey } from "@metaplex-foundation/umi"
import { getSOlBalance, getTokenInfo } from "../../controller/token"
import { importExistingWallet } from "../../controller/wallet"
import { getUser, updateUserParams, updateUserState, updateUserWallet } from "../../model/user"
import { botInstance } from "../../utils/bot"
import { USER_STATE } from "../../utils/constant"
import { db } from "../../utils/db"
import { eq, and } from "drizzle-orm";

import { orders, tokens, users } from "../../model/schema"
import { callbackSetting } from "../callback/setting"

import { fetchPrice } from "../../controller/api/fetchPrice";
import { PublicKey } from "@solana/web3.js";
import { checkSolanaAddressType } from "../../controller/token/validateAddress";
import { swapJupiter } from "../../controller/token/swap";


export const inputView = () => {
    botInstance.on('text', async (msg) => {
        if(msg.text![0] == '/') return;
        // const step = 1
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
                console.log(address)

                if(!isPublicKey(address)) {
                    await botInstance.sendMessage(
                        chatId,
                        'Invalid Address. Enter again.',
                    );
                    break;
                }
                const tokenOnDB = await db.select().from(tokens).where(and(eq(tokens.chatId, chatId), eq(tokens.address, address)))
                if(tokenOnDB.length){
                    await botInstance.sendMessage(chatId, `That address is already exists.\nGo to Manage to trade.`, {
                        reply_markup:{
                            inline_keyboard:[
                                [{ text:'Manage Tokens', callback_data:'manage' }],
                                [{ text:'<< Back', callback_data:'start' }]
                            ]
                        }
                    })
                    return;
                }
                const tokenInfo = await getTokenInfo(address);
                const tokenPrice = (await fetchPrice(address))?.data[address].value;
                console.log(tokenInfo, 'textinput/index:52')
                await updateUserParams(chatId, address);
                botInstance.sendMessage(
                    chatId,
                    `${tokenInfo.content.metadata.name} | $${tokenInfo.content.metadata.name}\n` + 
                    `<code>${address}</code>\n` + 
                    `Price: $${tokenPrice}\n`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [{text:'<< Back', callback_data: 'start'}],
                                [
                                    {text:`Buy ${user?.buyOption1} SOL`, callback_data: 'buy/option1'},
                                    {text:`Buy ${user?.buyOption2} SOL`, callback_data: 'buy/option2'},
                                    {text:`Buy X SOL`, callback_data: 'buy/optionx'}
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
                if(+msg.text! > 100 ){
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
                if(+msg.text! > 100 ){
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
            case USER_STATE.take_profit:
            case USER_STATE.stop_loss:
            case USER_STATE.trailing_stop_loss:
                if(isNaN(+msg.text!)){
                    botInstance.sendMessage(chatId, 
                        `Invalid value, Please enter again.`
                    )
                    break;
                }
                const userInsatance = await getUser(chatId)
                
                await db.insert(orders).values({
                    chatId,
                    tokenId: +userInsatance?.params!,
                    type: userInsatance?.state!,
                    value: msg.text!
                })
                const tokenAddress = (await db.select().from(tokens).where(eq(tokens.id, +userInsatance?.params!)))[0].address;
                await updateUserState(chatId, USER_STATE.idle);
                await botInstance.sendMessage(
                    chatId, 
                    `Successfully updated.`,
                    {
                        reply_markup:{
                            inline_keyboard: [[ {text: '<< Back', callback_data: `manage/token/${tokenAddress}`} ]]
                        }
                    }
                )
                break;
            case USER_STATE.snipe_setting:
                if(isNaN(+msg.text!)){
                    botInstance.sendMessage(chatId, 
                        `Invalid value, Please enter again.`
                    )
                    break;
                }
                await db.update(users).set({
                    snipeSolAmount: +msg.text!
                })
                await updateUserState(chatId, USER_STATE.idle);
                await callbackSetting(chatId, 'setting', 1)
                break;
            case USER_STATE.token_snipe:
                if((await checkSolanaAddressType(msg.text!)) == 'invalid'){
                    botInstance.sendMessage(chatId, 
                        `Invalid Address, Please enter again.`
                    )
                    break;
                }
                const userInst = await getUser(chatId)
                
                await db.insert(orders).values({
                    chatId,
                    type: userInst?.state!,
                    value: msg.text!
                })
                await updateUserState(chatId, USER_STATE.idle);
                await botInstance.sendMessage(
                    chatId, 
                    `New Sniping token Listed`,
                    {
                        reply_markup:{
                            inline_keyboard: [[ {text: '<< Back', callback_data: `start`} ]]
                        }
                    }
                )
                break;
            case USER_STATE.buy_x_amount:
                if(isNaN(+msg.text!)){
                    botInstance.sendMessage(chatId, 
                        `Invalid value, Please enter again.`
                    )
                    break;
                }
                await swapJupiter(chatId, user?.params!, +msg.text!, true, true)
                break;
            case USER_STATE.buy_x_amount_manage:
                if(isNaN(+msg.text!)){
                    botInstance.sendMessage(chatId, 
                        `Invalid value, Please enter again.`
                    )
                    break;
                }
                
                await swapJupiter(chatId, user?.params!, +msg.text!, true, false)
                break;
            case USER_STATE.sell_x_amount_manage:
                if(isNaN(+msg.text!)){
                    botInstance.sendMessage(chatId, 
                        `Invalid value, Please enter again.`
                    )
                    break;
                }
                if(+msg.text! > 100){
                    botInstance.sendMessage(chatId, 
                        `Invalid value, Please enter again.`
                    )
                    break;
                }
                const tokenAddress1 = user?.params?.split('_')[0]!;
                const tokenBalanceOfUser = +user?.params?.split('_')[1]!;
                const buysellAmount = +tokenBalanceOfUser * +msg.text! / 100;

                await swapJupiter(chatId, tokenAddress1, buysellAmount, false, false)
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