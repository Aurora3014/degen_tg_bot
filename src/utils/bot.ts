import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'
import { appInstance } from '../controller/webhook';
import '../controller/token/realtime'
dotenv.config()

const token = process.env.TELEGRAM_BOT_TOKEN!;
// console.log(token)
try {
    appInstance.listen(process.env.PORT || 6014)
    console.log('webhook listen on port' + process.env.PORT || 6014);
} catch (error) {
    console.log(error);
}
export const botInstance = new TelegramBot(token, { polling: true });