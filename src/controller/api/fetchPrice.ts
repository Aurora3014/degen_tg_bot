import axios from "axios";

interface PriceResponse {
    data: {
      [key: string]: {
        id: string;
        mintSymbol: string;
        vsToken: string;
        vsTokenSymbol: string;
        price: number;
      };
    };
    timeTaken: number;
  }
  
export  async function fetchPrice(address: string, mainAddress: string = "USDC") {

    try {
        
        const response = await axios.get<PriceResponse>('https://price.jup.ag/v6/price', {
            params: {
                ids: address,
                vsToken: mainAddress,
            },
        });
    
        const priceData = response.data.data[address];
        return response.data as PriceResponse
    } catch (error) {
        console.error('Error fetching price:', error);
        return undefined;
    }
}