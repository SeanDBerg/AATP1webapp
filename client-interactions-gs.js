function makeSheetEdit(rowId, columnHeader, newValue) {
  const clientInteractionsSheet = SpreadsheetApp.openById(
    clientInteractionsSSId
  ).getSheetByName("CLIENT ENCYCLOPEDIA");
  const data = clientInteractionsSheet.getDataRange().getValues();
  const headers = data.shift();
  const rowIndex = data.findIndex(f => f[headers.indexOf("ID")] == rowId);
  const sheetRow = rowIndex + 2;
  const columnIndex = headers.indexOf(columnHeader);
  const sheetColumn = columnIndex + 1;


  return { sheetRow, sheetColumn }
}
