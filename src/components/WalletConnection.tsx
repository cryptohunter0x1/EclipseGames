import React from 'react';

const WalletConnection: React.FC = () => {
  const handleClick = () => {
    console.log('Button clicked');
    alert('Button clicked');
  };

  return (
    <div>
      <button onClick={handleClick}>Test Button</button>
    </div>
  );
};

export default WalletConnection;
