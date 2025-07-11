function submitCarpetSampleCheckIn(formData, orderNumber, emailContentOb) {
  Logger.log(formData).log(emailContentOb)
  const { userEmail: creatorEmail, userName } = JSON.parse(getEffectiveUser());
  // const { userEmail: creatorEmail, userName } = getEffectiveUser();
  const logSheet = SpreadsheetApp.openById(carpetOrderDatabaseSSId).getSheetByName("sheet1");
  const logSheetData = logSheet.getDataRange().getValues();
  const logSheetHeaders = logSheetData[0];
  const logIdHeaderName = "LOG ID";
  const checkInStatusHeaderName = "CHECK STATUS";
  const checkInDateHeaderName = "CHECK DATE";
  const logIdHeaderIndex = logSheetHeaders.indexOf(logIdHeaderName);
  const noteStr = `updated by ${userName} - ${creatorEmail}`;

  let includeDeliveryInfo = false;

  // loop through for basic replacements
  for (let logId in formData) {
    const data = formData[logId];
    const value = data.value;

    if (!value) continue;

    updateCarpetSampleLogSheet(logSheet, logSheetData, logIdHeaderIndex, logSheetHeaders.indexOf(checkInDateHeaderName), logId, value, noteStr);
    updateCarpetSampleLogSheet(logSheet, logSheetData, logIdHeaderIndex, logSheetHeaders.indexOf(checkInStatusHeaderName), logId, "checked in", noteStr);

    Logger.log({ logId, value })
  };


  let emailContent = `SUBMITTED BY:\n%SUBMITTED BY%\n\n${clientInfoTemplate}\n\nDELIVERY METHOD: %ORDER STATUS%`;
  for (let d in emailContentOb) {
    let data = emailContentOb[d];
    let value = data.value;
    Logger.log({ d })

    if (d.indexOf("ORDER STATUS") > -1 && !includeDeliveryInfo && value && d != "DELIVERY METHOD") {
      includeDeliveryInfo = true;
      // emailContent += `\n\n${deliveryInfoTemplate}`;
      Logger.log(`found delivery: ${d}, ${value}`)
    }

    emailContent = emailContent.replace(new RegExp(`%${d}%`, "g"), value);
  };

  for (let i = 1; i <= emailContentOb.amountItems.value; i++) {
    let itemTemplate = i == 1 ? itemInfoTemplate : itemInfoTemplate.replace(/-1/g, `-${i}`);

    for (let d in emailContentOb) {
      let data = emailContentOb[d];
      let { value } = data;

      itemTemplate = itemTemplate.replace(new RegExp(`%${d}%`, "g"), value);

      //here, only grab the right items
      if (!meetsCriteria(d, i)) continue;

    };

    emailContent += `\n\n${itemTemplate}`;
  };


  //send email 
  MailApp.sendEmail(
    // `morgan@templestudiony.com, ${creatorEmail}`,
    "daniel@templestudiony.com",
    `New Carpet Sample Check-in: ${orderNumber}`,
    emailContent,
    { name: "Carpet Sample Update" }
  );
}

function updateCarpetSampleLogSheet(logSheet, logSheetData, logIdHeaderIndex, insertionHeaderIndex, logId, insertionValue, optionalNote) {
  try {

    const rowIndex = logSheetData.findIndex(f => f[logIdHeaderIndex] == logId);
    const range = logSheet.getRange(rowIndex + 1, insertionHeaderIndex + 1);

    range.setValue(insertionValue);

    if (optionalNote) range.setNote(optionalNote);

  } catch (error) { console.warn({ "updateCarpetSampleLogSheet error": error }) }
}




























