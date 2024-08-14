import axios from 'axios';

export interface SearchAssetsParams {
    ownerAddress: string;
    tokenType: string;
}

export interface TokenInfo {
    symbol: string;
    balance: number;
    supply: number;
    decimals: number;
    token_program: string;
    associated_token_address: string;
    price_info: {
        price_per_token: number;
        total_price: number;
        currency: string;
    };
}

export interface AssetContent {
    $schema: string;
    json_uri: string;
    metadata: {
        description: string;
        name: string;
        symbol: string;
        token_standard: string;
    };
    token_info: TokenInfo;
    // Add other fields as needed
}

export interface SearchAssetsResponse {
    id: string;
    content: AssetContent;
}

export async function searchAssets(params: SearchAssetsParams): Promise<SearchAssetsResponse> {
    const response = await axios.post(process.env.MAINNET_RPC!, {
        jsonrpc: '2.0',
        id: 'helius-test',
        method: 'searchAssets',
        params: params
    });

    return response.data;
}
