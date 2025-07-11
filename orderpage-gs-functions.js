function saveOrder(formData) {

  // formData = {'PURCHASE ORDER DATE':{id:'purchase-order-date', value:''}, 'CFA/STRIKE-OFF STATUS':{value:'', id:'cfa-status-stock-1'}, 'VENDOR UNIT OF MEASURE':{value:'YARD', id:'vendor-unit-of-measure-1'}}

  const tranSheet = SpreadsheetApp.openById(carpetSampleLogsSSId).getSheetByName("transaction database");
  const templateSheets = SpreadsheetApp.openById('1Sqoo_n1jgLdVLPDX3U86oTg6YqbQzkq0eO9EyvVZXmY');
  const hdrs = tranSheet.getRange(1, 1, 1, tranSheet.getLastColumn()).getValues()[0];
  var transactionData = [];

  hdrs.forEach(hdr => transactionData.push(formData[hdr]?.value ?? ""));

  Logger.log(transactionData)

  tranSheet.appendRow(transactionData);

  /**
   * Needs:
   * create folder with the transaction number as the title
   * in that folder, need 3 more folders
   *  - vendor folder
   *  - client folder
   *  - packing folder
   * need to create 3 pdfs
   *  - vendor pdf
   *  - client pdf
   *  - packing pdf
   */

  return "done"
}

















