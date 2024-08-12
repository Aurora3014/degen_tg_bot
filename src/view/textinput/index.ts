import { importExistingWallet } from "../../controller/wallet"
import { getUser, getUserState, updateUserState, updateUserWallet } from "../../model/user"
import { botInstance } from "../../utils/bot"
import { USER_STATE } from "../../utils/constant"

export const inputView = () => {
    botInstance.on('text', async (msg) => {
        if(msg.text![0] == '/') return;
        const step = 1
        const chatId = msg.chat.id;
        const user = await getUser(chatId)
        if(!user) console.error('Invalid ChatId!')
        switch(user!.state){
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
            case 'wallet':
                break;
            default: 
                await botInstance.sendMessage(msg.chat.id!, 'Oops. Unexpeceted Input!', {
                    reply_markup: {
                        inline_keyboard: [
                            [{text:'<< Back', callback_data: 'start'}]
                        ]
                    }
                });
        }
    })
}