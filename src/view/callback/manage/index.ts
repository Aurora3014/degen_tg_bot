import { CallbackQuery } from "node-telegram-bot-api";
import { getUser, updateUserParams, updateUserState } from "../../../model/user";
import { botInstance } from "../../../utils/bot";
import { getTokenOfUser, getTokensOfUser } from "../../../model/token";
import { REPLY_MARKUP_BUTTON, USER_STATE, WSOL_ADDRESS } from "../../../utils/constant";
// import { swapToken } from "../../../controller/token/swap";
import { getSOlBalance, getTokenBalance, getTokenInfo } from "../../../controller/token";
import { deleteLastMessage } from "../";
import BN from "bn.js";
import { closePosition } from "../../../controller/token/manage";
import { swapJupiter } from "../../../controller/token/swap";
import { fetchPrice } from "../../../controller/api/fetchPrice";


/**
    CallbackQuery "wallet/*"
*/
export const callbackManage = async (query: CallbackQuery, step: number) => {
    const chatId = query.message?.chat.id!;
    switch (query.data!.split('/')[step]){
        case undefined:
            let keyboards: REPLY_MARKUP_BUTTON[][] = [[]];
            await updateUserState(chatId, USER_STATE.buy_newbuy);
            const userTokens = await getTokensOfUser(chatId);

            userTokens.map(async (userToken) => {
                keyboards.push([{
                    text: '$' + userToken.tokens.name,
                    callback_data: `manage/token/${userToken.tokens.address}`
                }])
            })
            keyboards.push([{
                text: '<< Back',
                callback_data: 'start'
            }])
            
            await botInstance.sendMessage(chatId,`Reply Token Info or Enter new token address`,{
                reply_markup: {
                    inline_keyboard: keyboards                    
                }
            });
            
            if(!userTokens.length){
                await botInstance.sendMessage(
                    chatId,
                    `You have no Token Positions now`
                )
            }
            break;
        case 'token':
            deleteLastMessage(query);
            const address = query.data!.split('/')[step+1];
            const token = (await getTokenOfUser(chatId, address))[0]
            const tokenInfo = await getTokenInfo(address);
            const tokenInSOL = (await fetchPrice(address, WSOL_ADDRESS))!.data[WSOL_ADDRESS].price;
            const solInUSD = (await fetchPrice(WSOL_ADDRESS))!.data[WSOL_ADDRESS].price;
            const user = await getUser(chatId)
            // const owner = importExistingWallet( user!.secretKey! )
            // const raydium = await initRayidumInstance( owner)
            // const poolInfo = await getPoolInfo( owner, address )
            // const res = await raydium.liquidity.getRpcPoolInfos([])
            // (await raydium.api.getTokenInfo('jkhgdkhdkhgdkg'))[0].
            // await updateUserParams(chatId, address);
            const solBalance = await getSOlBalance(token.users.publicKey!);
            const tokenBalance = await getTokenBalance(token.users.publicKey!, address);
            const profitSol = 
                token.tokens.totalSpentSol.div(new BN(10 ** 9)).toNumber()- 
                tokenBalance * tokenInSOL ;
            
            await botInstance.sendMessage(chatId,
                `${tokenInfo.content.metadata.name} | $${tokenInfo.content.metadata.name}\n` + 
                `<code>${address}</code>\n` + 
                `Price: ${tokenInSOL} SOL\n` + 
                `Profit: ${profitSol} SOL\n` +
                `Total Spent: ${token.tokens.totalSpentSol.div(new BN (10 ** 9))} SOL\n` +
                `Token Balance: ${tokenBalance ? tokenBalance : 0} ${tokenInfo.content.metadata.name}\n` + 
                `SOL balance: ${solBalance} SOL`,

                {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {text:'Home', callback_data: 'start'},
                            {text:'Close', callback_data: `manage/close/${address}`},
                        ],
                        [
                            {text:`Buy ${user?.buyOption1} SOL`, callback_data: `manage/buy/1/${address}`},
                            {text:`Buy ${user?.buyOption2} SOL`, callback_data: `manage/buy/2/${address}`},
                            {text:'Buy X SOL', callback_data: `manage/buy/x/${address}`},
                        ],
                        [
                            {text:`Sell ${user?.sellOption1} %`, callback_data: `manage/sell/1/${address}`},
                            {text:`Sell ${user?.sellOption2} %`, callback_data: `manage/sell/2/${address}`},
                            {text:'Sell X %', callback_data: `manage/sell/x/${address}`},
                        ],
                        [
                            {text: 'Take Profit', callback_data: `manage/order/${USER_STATE.take_profit}/${address}`},
                            {text: 'Stop Loss', callback_data: `manage/order/${USER_STATE.stop_loss}/${address}`},
                            {text: 'Trailing SL', callback_data: `manage/order/${USER_STATE.trailing_stop_loss}/${address}`},
                        ],
                        [
                            {text: 'Explorer', url:`https://explorer.solana.com/address/${address}`},
                            {text: 'Birdeye', url:`https://birdeye.so/token/${address}?chain=solana`},
                            {text: 'Solscan', url:`https://solscan.io/token/${address}`}
                        ],
                        [
                            {text: 'Refresh', callback_data: `manage/token/${address}`}
                        ]
                    ]
                },
                parse_mode: 'HTML'
            });
            await updateUserState(chatId, USER_STATE.buy_newbuy);
            break;
            
        case 'buy':
        case 'sell':
            const currentUser = await getUser(chatId);

            const optionString = query.data!.split('/')[step + 1];
            const tokenAddress = query.data?.split('/')[step + 2];
            let buysellAmount = 0;
            let isBuy = true;
            if(query.data!.split('/')[step] == 'buy'){
                isBuy = true
                if(optionString == '1'){
                    buysellAmount = currentUser?.buyOption1!;
                } else if(optionString == '2'){
                    buysellAmount = currentUser?.buyOption2!;
                } else {
                    console.log('Buy X amount in Manage page\n To do...');
                    break;
                }
            } else {
                isBuy = false
                if(optionString == '1'){
                    buysellAmount = currentUser?.sellOption1!;
                } else if(optionString == '2'){
                    buysellAmount = currentUser?.sellOption2!;
                } else {
                    console.log('Sell X amount in Manage page\n To do...');
                    break;
                }
            }
            await swapJupiter(chatId, tokenAddress!, buysellAmount, isBuy)

            break;
        case 'close':
            await closePosition(chatId, query.data!.split('/')[step + 1])
            break;
        case 'order':
            await updateUserState(chatId, query.data!.split('/')[step + 1]);
            await updateUserParams(chatId, query.data!.split('/')[step + 2])
            break;
        default:
            break

    }

}