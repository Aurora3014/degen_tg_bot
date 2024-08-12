import dotenv from 'dotenv'
import TelegramBot from 'node-telegram-bot-api'

dotenv.config()

const token = process.env.TELEGRAM_BOT_TOKEN!;
// console.log(token)
export const botInstance = new TelegramBot(token, { polling: true });