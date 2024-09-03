import { getTokenBalance } from ".";
import { getTokenPrices, getTokensOfUser } from "../../model/token";
import { getUsers } from "../../model/user"
import { USER_STATE } from "../../utils/constant";
import { eq } from "drizzle-orm"
import { swapJupiter } from "./swap";
import { db } from "../../utils/db";
import { orders, tokens } from "../../model/schema";
import { botInstance } from "../../utils/bot";
// TP, SL, T-SL
const realtimeInstance = setInterval(async () => {
    try {
        const tokenPrices = await getTokenPrices();
        if(!tokenPrices)
            return;
        console.log(tokenPrices)
        // watch dog for TP, SL, TS. 
        const users = await getUsers();
        // const solPrice = (await fetchPrice(WSOL_ADDRESS))?.data[WSOL_ADDRESS].price;
        if(!users)
            return;
        users.map(async user => {
            // const owner = importExistingWallet( user!.secretKey! )
            // const rayduium = await initRayidumInstance(owner);
            const tokensData = await getTokensOfUser(user.chatId);
            if(!tokensData)
                return;
            tokensData.map( async token => {
                
                if(token.tokens.maxPrice < tokenPrices!.data[token.tokens.address].value)
                    db.update(tokens).set({maxPrice: tokenPrices!.data[token.tokens.address].value}).where(eq(tokens.id, token.tokens.id));
                
                let tokenBalance = (await getTokenBalance(user.publicKey!, token.tokens.address));
                const orderData = await db.select().from(orders).where(eq(orders.tokenId, token.tokens.id))
                console.log(tokenBalance, token.tokens.address, user.publicKey!);
                orderData.map(async order => {
                    console.log(order.id, 'checking order');
                    if(USER_STATE.take_profit == order.type){
                        if(order.value >= tokenPrices!.data[token.tokens.address].value){
                            await swapJupiter(user.chatId, token.tokens.address, tokenBalance , false)
                            await db.delete(orders).where(eq(orders.id, order.id));
                            console.log('TP closed')
                            botInstance.sendMessage(user.chatId, `$${token.tokens.name} sold out due to Take Profit`)
                        }
                    } else if(USER_STATE.stop_loss  == order.type){
                        if(order.value <= tokenPrices!.data[token.tokens.address].value){
                            await swapJupiter(user.chatId, token.tokens.address, tokenBalance , false)
                            await db.delete(orders).where(eq(orders.id, order.id));
                            console.log('SL closed')
                            botInstance.sendMessage(user.chatId, `$${token.tokens.name} sold out to Stop Loss`)
                        }
                    } else if(USER_STATE.trailing_stop_loss == order.type){
                        if(token.tokens.maxPrice * order.value / 100 <= tokenPrices!.data[token.tokens.address].value){
                            await swapJupiter(user.chatId, token.tokens.address, tokenBalance , false)
                            await db.delete(orders).where(eq(orders.id, order.id));
                            console.log('TSL closed')
                            botInstance.sendMessage(user.chatId, `$${token.tokens.name} sold out to Trailing Stop`)
                        }
                    }
                })
            })
        })
    } catch (error) {
        console.log(error)
    }
}, 10000)