// Used to receive payment confirmations from Stripe
function doPost(e) {
  Logger.log(e)
  const response = {  // To do: setResponseCode is not a method of ContentService, so this will not work
    "ok": ContentService.createTextOutput('OK')
      .setMimeType(ContentService.MimeType.TEXT),
    "noSignature": ContentService.createTextOutput('Missing Signature')
      .setMimeType(ContentService.MimeType.TEXT).setResponseCode(400),
    "invalidSignature": ContentService.createTextOutput('Invalid Signature')
      .setMimeType(ContentService.MimeType.TEXT).setResponseCode(400),
    "slowDelivery": ContentService.createTextOutput('Slow Delivery')
      .setMimeType(ContentService.MimeType.TEXT).setResponseCode(400),
    "serverError": ContentService.createTextOutput('Server Error')
      .setMimeType(ContentService.MimeType.TEXT).setResponseCode(500)
  };

  try {
    const validationResult = validateStripeSignature(e);
    if (!validationResult.success) {
      Logger.log(validationResult.message);
      return response[validationResult.failCode];
    }

    const isNewEvent = verifyEventIdIsNew(e);
    if (!isNewEvent) return response.ok;

    const eventData = extractStripeEventData(e);
    scheduleSheetUpdate(eventData, 'stripe');

    return response.ok;
 }
 
 catch(error) {
  Logger.log(error)
  return response.serverError;
 }
}

function validateStripeSignature(e) {
  const result = {
    success: false,
    message: '',
    failCode: ''
  }

}

function verifyEventIdIsNew(e) {
  const eventId = e.parameter.id; // To do: Find where eventId is in the e object
  const eventKey = `stripe_eventId_${eventId}`;
  const scriptProps = PropertiesService.getScriptProperties();
  const eventTimestamp = scriptProps.getProperty(eventKey);

  if (eventTimestamp) return false;

  scriptProps.setProperty(eventKey, Date.now());
  return true;
}

function cleanseEventIdProperties() {
  const scriptProps = PropertiesService.getScriptProperties();
  const allKeys = scriptProps.getKeys();
  const eventKeys = allKeys.filter(key => key.startsWith('stripe_eventId_'));
  
  const waitTime = 1000 * 60 * 60 * 24 * 7;  
  const now = Date.now();
  for (const eventKey in eventKeys) {
    const timestamp = parseInt(scriptProps.getProperty(eventKey));
    if (now - timestamp > waitTime) {
      scriptProps.deleteProperty(prop);
    }
  }
}

function extractStripeEventData(e) {}

function scheduleSheetUpdate(data, source) {}