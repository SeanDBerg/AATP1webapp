function getLookerStudioInfo() {
  const { userName } = JSON.parse(getEffectiveUser());

  const lookerStudioSS = SpreadsheetApp.openById('1GepS2E6uzYUYz2UzfcFCiTViVRxeiR_F7oamuEABD0s');
  const allReportRows = lookerStudioSS.getSheets()[0].getDataRange().getDisplayValues();
  const headers = allReportRows.shift().map(header => header.toLowerCase());
  const userColNum = headers.indexOf(userName.toLowerCase());

  const lsInfo = allReportRows.filter(
    row => row[userColNum] === 'TRUE'
  ).map(
    row => {
      return {
        name: row[0],
        link: row[1]
      }
    }
  );
  return lsInfo
}