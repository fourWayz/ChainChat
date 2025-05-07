// Error codes and messages for Account Abstraction
const AA_ERROR_CODES: { [key: string]: string } = {
    'AA00': 'Sender already constructed',
    'AA01': 'Initcode must return sender',
    'AA10': 'Sender doesn\'t have enough funds to pay for prefund',
    'AA13': 'Invalid paymasterAndData',
    'AA20': 'Account not deployed and no initcode',
    'AA21': 'Didn\'t pay prefund',
    'AA22': 'Unsupported signature aggregator',
    'AA23': 'Signature error',
    'AA24': 'Invalid nonce',
    'AA25': 'Missing paymaster stake or data',
    'AA30': 'Paymaster deposit too low',
    'AA31': 'Paymaster stake too low',
    'AA32': 'Paymaster unstaked or not stable yet',
    'AA33': 'Paymaster post-operation failed',
    'AA40': 'Over verification gas limit',
    'AA41': 'Over maximum operation size',
    'AA50': 'Transaction reverted during simulation',
    'AA51': 'Transaction would fail or has failed on-chain',
    'PM01': 'Paymaster token error',
    'PM02': 'Paymaster rate error',
    'PM03': 'Paymaster balance error',
  };
  
  /**
   * Extract error code from error message
   * 
   * @param error The error object
   * @returns Error code or null if not found
   */
  export const extractErrorCode = (error: any): string | null => {
    if (!error) return null;
    
    // Get the error message string
    const errorMessage = error.message || error.toString();
    
    // Extract AA error codes (format: AA## or FailedOp(##, "..."))
    const aaMatch = errorMessage.match(/AA(\d\d)/);
    if (aaMatch) return `AA${aaMatch[1]}`;
    
    // Extract Paymaster error codes
    const pmMatch = errorMessage.match(/PM(\d\d)/);
    if (pmMatch) return `PM${pmMatch[1]}`;
    
    // Extract error from FailedOp format
    const failedOpMatch = errorMessage.match(/FailedOp\((\d+),\s*"([^"]*)"/);
    if (failedOpMatch) {
      const code = parseInt(failedOpMatch[1]);
      // Map code to AA error format
      if (code >= 0 && code <= 99) {
        return `AA${code.toString().padStart(2, '0')}`;
      }
    }
    
    return null;
  };
   
  export const getReadableErrorMessage = (error: any): string => {
    // Extract error code
    const errorCode = extractErrorCode(error);
    
    // Get error message from map if code exists
    if (errorCode && AA_ERROR_CODES[errorCode]) {
      return `${AA_ERROR_CODES[errorCode]} (${errorCode})`;
    }
    
    // Handle other common Ethereum errors
    const errorMessage = error.message || error.toString();
    
    if (errorMessage.includes("insufficient funds")) {
      return "Insufficient funds to execute this transaction";
    }
    
    if (errorMessage.includes("execution reverted")) {
      // Try to extract the revert reason
      const revertMatch = errorMessage.match(/execution reverted: (.*?)($|")/);
      if (revertMatch) {
        return `Transaction reverted: ${revertMatch[1]}`;
      }
      return "Transaction reverted - check the target contract";
    }
    
    // If no specific error identified, return the original message
    return errorMessage;
  };
  
  /**
   * Check if error is related to paymaster issues
   * 
   * @param error Error object
   * @returns True if error is related to paymaster
   */
  export const isPaymasterError = (error: any): boolean => {
    // TODO: Implement paymaster error check
    
    return false;
  };
  
  /**
   * Handle common errors and return user-friendly messages
   * 
   * @param error Error object
   * @returns User-friendly error message
   */
  export const handleError = (error: any): string => {
    // TODO: Implement comprehensive error handling
    
    return getReadableErrorMessage(error);
  }; 