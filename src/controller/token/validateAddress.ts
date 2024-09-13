import { PublicKey } from '@solana/web3.js';

/**
 * Checks the type of a Solana address.
 * @param address - The Solana address to check.
 * @returns The type of address: 'valid', 'invalid', 'program', or 'system'.
 */
export const checkSolanaAddressType = async (address: string): Promise<string> => {
  try {
    // Validate if it's a valid Solana address
    const publicKey = new PublicKey(address);

    // Check if the public key is a program-derived address
    const isProgramAddress = PublicKey.isOnCurve(publicKey) === false;

    if (isProgramAddress) {
      return 'program';
    }

    // Check if it's a valid system address (normal user account)
    const isValid = PublicKey.isOnCurve(publicKey);
    if (isValid) {
      return 'system';
    }

    return 'valid';
  } catch (error) {
    return 'invalid'; // Not a valid Solana address
  }
};