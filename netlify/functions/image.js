const { createCanvas } = require('canvas');

exports.handler = async function(event, context) {
  // Parse prices from query
  const prices = event.queryStringParameters.prices 
    ? JSON.parse(decodeURIComponent(event.queryStringParameters.prices)) 
    : {};
  
  // Create canvas
  const canvas = createCanvas(1200, 630);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = '#1e2d3a';
  ctx.fillRect(0, 0, 1200, 630);
  
  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial';
  ctx.fillText('$PAGE Token Prices', 100, 100);
  
  // Prices
  ctx.font = '32px Arial';
  let y = 200;
  
  if (prices.ethereum) {
    ctx.fillText(`Ethereum: $${prices.ethereum.toFixed(4)}`, 100, y);
    y += 60;
  }
  
  // Add other chains...
  
  // Average price
  const values = Object.values(prices).filter(p => p > 0);
  const avgPrice = values.length > 0 
    ? values.reduce((a, b) => a + b, 0) / values.length 
    : 0;
    
  ctx.font = 'bold 40px Arial';
  ctx.fillText(`Average Price: $${avgPrice.toFixed(4)}`, 100, y + 40);
  
  // Convert to PNG
  const buffer = canvas.toBuffer('image/png');
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'image/png'
    },
    body: buffer.toString('base64'),
    isBase64Encoded: true
  };
};
