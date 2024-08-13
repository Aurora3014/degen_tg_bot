import { CallbackQuery } from "node-telegram-bot-api";
import { botInstance } from "../../utils/bot";
import { createNewWallet, importExistingWallet } from "../../controller/wallet";
import { getUser, getUserState, updateUserState, updateUserWallet } from "../../model/user";
import { USER_STATE } from "../../utils/constant";


/**
    CallbackQuery "wallet/*"
*/
export const callbackWallet = async (query: CallbackQuery, step: number) => {
    const chatId = query.message?.chat.id!;
    switch (query.data!.split('/')[step]){
        case 'create':
            await callbackWalletCreate(query, step + 1);
            break;
        case 'import':
            await updateUserState(chatId, USER_STATE.wallet_import);
            
            await botInstance.sendMessage(chatId, `Import Wallet Page\nIf you import new wallet, previous wallet will be renounced.\nPlease enter secret key.`, {
                reply_markup: {
                    inline_keyboard: [
                        [{text:'<< Back', callback_data: 'wallet'}]
                    ]
                }
            })
            break;
        case 'withdraw':
            
            break;
        default:
            const user = await getUser(chatId);
            await botInstance.sendMessage(chatId, `Wallet Main Page\n ${user?.publicKey ? `Address: ${user.publicKey}` : `You have no wallet, Create or import one.`}`,{
                reply_markup: {
                    inline_keyboard: [
                        [
                            {text:'Create', callback_data: 'wallet/create'},
                            {text:'import', callback_data: 'wallet/import'}
                        ],
                          [{text:'<< Back', callback_data: 'start'}]
                    ]
                }
            })
    } 

}
/**
    CallbackQuery "wallet/create/*"
*/
const callbackWalletCreate = async (query: CallbackQuery, step: number) => {
    const chatId = query.message?.chat.id!;
    const user = await getUser(chatId);
    const newLocal = user ? `You have wallet already, Will you renounce previous wallet and Create new ?` : `Tap/click 'Yes' to continue`;
    switch (query.data!.split('/')[step]){
        case 'yes':
            const keypair = createNewWallet();
            await updateUserWallet(chatId, keypair);
            await botInstance.sendMessage(chatId, `New wallet created!\nAddress: ${keypair.publicKey}`, {
                reply_markup: {
                    inline_keyboard: [
                        [{text:'<< Back', callback_data: 'wallet'}]
                    ]
                }
            })
            break;
        default:
            botInstance.sendMessage(
                chatId,
                newLocal,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {text:'Yes', callback_data: 'wallet/create/yes'},
                                {text:'No', callback_data: 'wallet'}
                            ],
                        ]
                    }
                }
            )
    }
}