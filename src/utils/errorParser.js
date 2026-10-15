export const parseWeb3Error = (error) => {
  if (!error) return 'Unknown error';

  // Web3 v4 wraps revert reasons here
  const inner = error?.cause ?? error?.data ?? error?.innerError;

  // Try to extract the Solidity revert message string
  const candidates = [
    inner?.message,
    inner?.reason,
    error?.reason,
    // Web3 v4 sometimes puts it in error.data.message
    error?.data?.message,
    // Fallback: parse it out of the raw message string
  ];

  for (const msg of candidates) {
    if (msg && typeof msg === 'string' && !msg.includes('{')) {
      return msg;
    }
  }

  // Last resort: try to extract revert reason from the raw message
  const raw = error?.message || '';
  const match = raw.match(/revert(?:ed)?(?: with reason string)? ["']?([^"'\n{]+)["']?/i)
    || raw.match(/execution reverted: ([^\n{]+)/i);
  if (match?.[1]) return match[1].trim();

  // If the message is a huge JSON blob, give a cleaner fallback
  if (raw.includes('blockHash')) {
    return 'Transaction reverted by the contract. Check your input values.';
  }

  return raw || 'Unknown error';
};