import { DasApiAsset } from "@metaplex-foundation/digital-asset-standard-api";
import { TxVersion } from "@raydium-io/raydium-sdk-v2";

export const USER_STATE = {
    idle: 'IDLE',
    start: 'START',
    wallet: 'WALLET',
    wallet_import: 'WALLET_IMPORT',
    buy_newbuy: 'BUY_NEWBUY',
    buy_option_1: 'BUY_OPTION_1',
    buy_option_2: 'BUY_OPTION_2',
    sell_option_1: 'SELL_OPTION_1',
    sell_option_2: 'SELL_OPTION_2',
    buy_slippage: 'BUY_SLIPPAGE',
    sell_slippage: 'SELL_SLIPPAGE',
    stop_loss: 'SL',
    take_profit: 'TP',
    trailing_stop_loss: 'TSL'

}

export const RAYDIUM_LIQUIDITY_POOL_V4_ADDRESS = "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8";
export const WSOL_ADDRESS = "So11111111111111111111111111111111111111112";
export const txVersion = TxVersion.V0 // or TxVersion.LEGACY

export interface DasApiAssetWithTokenInfo extends DasApiAsset {
    token_info: {
      symbol: string;
      supply: number;
      decimals: number;
      token_program: string;
      price_info: {
        price_per_token: number;
        currency: string;
      };
      mint_authority: string;
      freeze_authority: string;
    };
  }

export interface REPLY_MARKUP_BUTTON {
  text: string,
  callback_data: string
}