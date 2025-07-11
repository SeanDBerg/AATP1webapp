function include(filename) {
  console.log(`including ${filename}`);
  // if (filename == "js") console.log(HtmlService.createHtmlOutputFromFile(filename).getContent())
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function loadPage(optionalInclusionArray) {
  const mainObject = {};
  const loadObject =
    [
      { id: clientDirectorySSId, key: "clients", sheetName: "client directory", hdrKey: "CLIENT NAME", hdrIndex: 0, dataType: "objectifySheet" },
      { id: wallpaperAndFabricSSId, key: "products", sheetName: "product database", hdrKey: "TEMPLE DM CODE", hdrIndex: 0, dataType: "objectifySheet" },
      { id: vendorDataSSId, key: "vendors", sheetName: "vendor roster", hdrKey: "COMPANY NAME", hdrIndex: 0, dataType: "objectifySheet" },
      { id: carpetOrderDatabaseSSId, key: "carpetSampleTransactions", sheetName: "Sheet1", hdrKey: "ORDER NUMBER", hdrIndex: 0, dataType: "objectifySheetWithGroupedRows" },
      { id: freightCalculatorSSId, key: "freightCalculationTable", sheetName: "Sheet2", hdrKey: "ID", hdrIndex: 1, dataType: "objectifySheet" },
      { id: clientInteractionsSSId, key: "clientInteractions", sheetName: "CLIENT ENCYCLOPEDIA", hdrKey: "ID", hdrIndex: 0, dataType: "objectifySheet" },
      { id: rugDatabaseSSId, key: "rugDatabase", sheetName: "RUG SAMPLE DATABASE", hdrKey: "COMPLETE SAMPLE ITEM NAME", hdrIndex: 0, dataType: "objectifySheet" },
    ];

  loadObject.forEach(s => {
    Logger.log({ s })

    if (optionalInclusionArray) {
      if (!optionalInclusionArray.includes(s.key)) {
        return;
      }
    }

    let ss = SpreadsheetApp.openById(s.id);
    let sheet = ss.getSheetByName(s.sheetName);
    let data = sheet.getDataRange().getDisplayValues();
    let objectResult = eval(`${s.dataType}(data, s.hdrIndex || 0, s.hdrKey)`);

    mainObject[s.key] = objectResult;
  });

  return JSON.stringify(mainObject)
}

function objectifySheet(data, headerIndex, keyHeader) {
  const ob = {};
  const headers = data.splice(headerIndex, 1)[0];

  data.forEach(row => {
    let rowOb = {};
    row.forEach((col, colIndex) => rowOb[headers[colIndex]] = col);
    ob[rowOb[keyHeader]] = rowOb;
  })

  return ob
}

function objectifySheetWithGroupedRows(data, headerIndex, keyHeader) {
  const ob = {};
  const headers = data.splice(headerIndex, 1)[0];

  data.forEach(row => {
    let rowOb = {};

    //goes through each value in the row, assigns it as a value to the key of the header above it
    row.forEach((col, colIndex) => rowOb[headers[colIndex]] = col);

    //defines the keyheader of the row as the key of the object, sets it the first time to an array
    if (!ob[rowOb[keyHeader]]) ob[rowOb[keyHeader]] = [];

    //pushes the rowOb into the objects keay header for this row's keyheader key
    ob[rowOb[keyHeader]].push(rowOb);

  })

  return ob
}

function navigation(destination, optionalAdditionalObject) {
  console.log({ destination, optionalAdditionalObject });
  const html = HtmlService.createTemplateFromFile(destination);
  const htmlOb = {
    baseWebAppUrl,
    orderNumber: getOrderNumber(),
  };

  if (optionalAdditionalObject) Object.assign(htmlOb, optionalAdditionalObject);

  for (let h in htmlOb) {
    html[h] = htmlOb[h];
  }

  return { html: html.evaluate().getContent(), pageSubtitle: pageSubtitleOb[destination] };
}



/**
 * find the order number here, this function for the orders portal only
 */
function getOrderNumber() {
  return "10101"
}

function getEffectiveUser() {
  const userEmail = Session.getEffectiveUser().getEmail();
  const userName = capFirstLetter(userEmail.slice(0, userEmail.indexOf("@")));
  const user = { userEmail, userName };
  Logger.log(user)

  return JSON.stringify(user);
}

// function getEffectiveUser() {
//   Logger.log("running getEffectiveUser() from gs file")
//   const userEmail = Session.getEffectiveUser().getEmail();
//   const userName = capFirstLetter(userEmail.slice(0, userEmail.indexOf("@")));
//   Logger.log({ userEmail, userName })

//   return { userName, userEmail }
// }

function capFirstLetter(str) {
  if (str.length) {
    return `${str[0].toString().toUpperCase()}${str.slice(1)}`
  }
  return str
}

function testIt() {
  const sheet = SpreadsheetApp.openById(clientDirectorySSId).getSheetByName("client directory");
  var data = sheet.getDataRange().getValues();
  // Logger.log(data)
  var clients = objectifySheet(data, 0, "COMPANY NAME");

  for (client in clients) {
    Logger.log(clients[client]["COMPANY NAME"])
  }
  // Logger.log(clients.map(m => m["COMPANY NAME"]))


}


