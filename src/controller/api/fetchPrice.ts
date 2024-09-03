import axios from "axios";

interface PriceResponse {
    data: {
      [key: string]: {
        updateUnixTime: string;
        updateHumanTime: string;
        priceChange24h: string;
        value: number;
      };
    };
    timeTaken: number;
  }
  
export async function fetchPrice(address: string, mainAddress?: string) {

    try {
      console.log('fetchPrice: ' + address)
      if(!address){
        console.log('non-address error')
        return;
      }
        const response = await axios.get<PriceResponse>('https://birdeye-proxy.jup.ag/defi/multi_price?', {
            params: {
                list_address: address + (mainAddress ? `,${mainAddress}` : ''),
                // vsToken: mainAddress,
            },
        });
        let priceInMainAddress = 0;
        return response.data as PriceResponse
    } catch (error) {
        console.error('Error fetching price:', error);
        return undefined;
    }
}
