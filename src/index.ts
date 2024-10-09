import { Connection, PublicKey } from "@solana/web3.js";
import { view } from "./view/main";
import dotenv from 'dotenv'
import { LIQUIDITY_STATE_LAYOUT_V4 } from "@raydium-io/raydium-sdk";
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";
dotenv.config();
view();

// const connection = new Connection(process.env.MAINNET_RPC!);
// const ammProgramId = new PublicKey('675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8');
// console.log('start')
// connection.onProgramAccountChange(ammProgramId,
//     async (updatedAccountInfo) => {
//         console.log(updatedAccountInfo)
//     },
//     'confirmed',
//     [
//         { dataSize: LIQUIDITY_STATE_LAYOUT_V4.span },
//         {
//           memcmp: {
//             offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf('marketProgramId'),
//             bytes: ammProgramId.toBase58(),
//           },
//         },
//         {
//           memcmp: {
//             offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf('status'),
//             bytes: bs58.encode([6, 0, 0, 0, 0, 0, 0, 0]),
//           },
//         },
//       ],
// )