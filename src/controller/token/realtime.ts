import BN from "bn.js";
import { getTokenBalance, getTokenInfo } from ".";
import { getTokensOfUser } from "../../model/token";
import { getUsers } from "../../model/user"
import { initRayidumInstance } from "../../utils/amm";
import { WSOL_ADDRESS } from "../../utils/constant";
import { importExistingWallet } from "../wallet";
import { getSLPrice, getTPPrice, getTSPrice } from "./manage";
import { swapJupiter } from "./swap";
import { fetchPrice } from "../api/fetchPrice";
// TP, SL, T-SL
const realtimeInstance = setInterval(async () => {
    try {
        // watch dog for TP, SL, TS. 
        const users = await getUsers();
        const solPrice = (await fetchPrice(WSOL_ADDRESS))?.data[WSOL_ADDRESS].price;
        if(!users)
            return;
        users.map(async user => {
            // const owner = importExistingWallet( user!.secretKey! )
            // const rayduium = await initRayidumInstance(owner);
            const tokens = await getTokensOfUser(user.chatId);
            if(!tokens)
                return;
            tokens.map( async token => {
                const tokenPriceInSol = (await fetchPrice(token.tokens.address, WSOL_ADDRESS))?.data[token.tokens.address].price!
                const topLimit = await getTPPrice(token.tokens.totalSpentSol.div(new BN(1000_000_000)).toNumber())
                const bottomLimit = await getSLPrice(token.tokens.totalSpentSol.div(new BN(1000_000_000)).toNumber())
                const bottomSaleLimit = await getTSPrice(token.tokens.totalSpentSol.div(new BN(1000_000_000)).toNumber());
                if(topLimit <= tokenPriceInSol || bottomLimit >= tokenPriceInSol || bottomSaleLimit >= tokenPriceInSol){
                    const tokenBalance = await getTokenBalance(user.publicKey!, token.tokens.address);
                    await swapJupiter(user.chatId, token.tokens.address, tokenBalance, false);
                }
            })
        })
    } catch (error) {
        console.log(error)
    }
}, 3000)