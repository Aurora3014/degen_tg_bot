import axios from "axios";
import { TokenResponse, USER_STATE } from "../../utils/constant";

export const fetchTokenDataFromDexscreener = async (tokenAddress: string) => {
    try {
        const response = await axios.get<TokenResponse>(
          'https://api.dexscreener.com/latest/dex/tokens/' + tokenAddress
        );
        
        const data = response.data;

        return data;
      } catch (error) {
        console.error('Error fetching token data:', error);
      }
}
