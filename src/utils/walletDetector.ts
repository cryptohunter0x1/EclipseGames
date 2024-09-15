export const detectWallet = () => {
  console.log('Detecting wallet...');
  if (typeof window === 'undefined') return null;

  if (window.ethereum?.isSalmon) {
    console.log('Salmon wallet detected');
    return 'salmon';
  } else if (window.backpack) {
    console.log('Backpack wallet detected');
    return 'backpack';
  }
  console.log('No compatible wallet detected');
  return null;
};
