function queryStripe(urlPostFix, methodType = "get", payloadStr = "") {
  const scriptProps = PropertiesService.getScriptProperties();
  // const stripeMode = scriptProps.getProperty('stripe_mode');

  // const SECRET_KEY_TEST = scriptProps.getProperty('stripe_test_secret');
  // const SECRET_KEY_LIVE = scriptProps.getProperty('stripe_live_secret');
  // const SECRET_KEY = stripeMode === 'test' ? SECRET_KEY_TEST : SECRET_KEY_LIVE;
  const SECRET_KEY = scriptProps.getProperty('stripe_live_secret');
  const BASE_URL = 'https://api.stripe.com';
  const BASE_OPTIONS = {
    headers: {
      'Authorization': `Bearer ${SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    muteHttpExceptions: true,
  };

  const url = BASE_URL + urlPostFix;
  const options = {
    method: methodType,
    payload: payloadStr,
    ...BASE_OPTIONS
  };

  const response = UrlFetchApp.fetch(url, options);
  const responseText = response.getContentText();
  if (response.getResponseCode() !== 200) {
    let errorMessage = '';
    if (urlPostFix.includes('products')) {
      errorMessage = 'failed to create product: ' + responseText;
    } else if (urlPostFix.includes('prices')) {
      errorMessage = 'failed to set price for product: ' + responseText;
    } else if (urlPostFix.includes('payment_links')) {
      errorMessage = 'failed to create payment link: ' + responseText;
    }
    Logger.log(errorMessage);
    throw new Error(errorMessage);
  }

  return JSON.parse(responseText);
}

// function testCreate() {
//   const quoteInfo = { 'requested-deposit': '$0.00',
//   'client-name': '323 Designs',
//   'quote-number': '106PW',
//   name: '323 Designs (Quote No: 106PW)',
//   sidemark: 'Ottoline Fabric',
//   'unit-amount': '$0.00' };

//   createStripePaymentLink(quoteInfo);
// }

function createStripePaymentLink(quoteInfo) {
  console.log(quoteInfo);

  // Create a product
  const prodDescription = `Sidemark: ${quoteInfo.sidemark}`;
  const productPostfix = '/v1/products';
  const productPayload = quoteInfo.sidemark !== '' ?
    `name=${quoteInfo.name}&description=${prodDescription}` :
    `name=${quoteInfo.name}`;
  const product = queryStripe(productPostfix, 'post', productPayload);
    
  // Assign a price to the product
  const priceInCents = parseInt(parseFloat(quoteInfo["unit-amount"].replace("$", "").replace(",", "")) * 100);
  const pricePostfix = '/v1/prices';
  const pricePayload = `currency=usd&product=${product.id}&unit_amount=${priceInCents}`;
  const price = queryStripe(pricePostfix, 'post', pricePayload)
  
  // Use the priced product to create a payment link
  const completionMessage = `Thank you for your order. A payment to TEMPLE DESIGN STUDIO will appear on your statement. Our team will be in touch with updates about your order.`;
  const payLinkPostfix = '/v1/payment_links';
  const userEmail = JSON.parse(getEffectiveUser()).userEmail;
  const payLinkPayload = `line_items[0][price]=${price.id}&line_items[0][quantity]=1&restrictions[completed_sessions][limit]=1&after_completion[type]=hosted_confirmation&after_completion[hosted_confirmation][custom_message]=${completionMessage}&metadata[quote_number]=${quoteInfo["quote-number"]}&metadata[client_name]=${quoteInfo["client-name"]}&metadata[sidemark]=${quoteInfo.sidemark}&metadata[requested_deposit]=${quoteInfo["requested-deposit"]}&metadata[user_email]=${userEmail}&metadata[quoteId]=${quoteInfo['quoteId']}`;
  const paymentLink = queryStripe(payLinkPostfix, 'post', payLinkPayload);

  return paymentLink.url;
}

// function setStripeMode(mode) {
//   const scriptProps = PropertiesService.getScriptProperties();
//   scriptProps.setProperty('stripe_mode', mode);
// }
