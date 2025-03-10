const { fetchPagePrices } = require('../../src/utils/tokenServices');

exports.handler = async function(event, context) {
  const prices = await fetchPagePrices();
  
  // Calculate average price
  const values = Object.values(prices).filter(p => p > 0);
  const avgPrice = values.length > 0 
    ? values.reduce((a, b) => a + b, 0) / values.length 
    : 0;
    
  // Create Frame HTML
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta property="fc:frame" content="vNext" />
      <meta property="fc:frame:image" content="${process.env.URL}/.netlify/functions/image?prices=${encodeURIComponent(JSON.stringify(prices))}" />
      <meta property="fc:frame:button:1" content="View on PageDAO" />
      <meta property="fc:frame:button:1:action" content="link" />
      <meta property="fc:frame:button:1:target" content="https://app.pagedao.org/page-token" />
      <meta property="og:title" content="$PAGE Token Interchain Prices" />
      <meta property="og:description" content="Check $PAGE prices across chains" />
    </head>
    <body>
      <h1>$PAGE Token Prices</h1>
    </body>
    </html>
  `;
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html'
    },
    body: html
  };
};
