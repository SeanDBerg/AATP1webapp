function sendCarpetSampleEmail(formData) {
  console.log(formData);

  //carpet-sample-page = carpet sample check out

  const logSheet = SpreadsheetApp.openById(carpetOrderDatabaseSSId).getSheetByName("sheet1");
  const logSheetData = logSheet.getDataRange().getValues();
  const logSheetHeaders = logSheetData[0];
  const logIdsList = logSheetData.map(m => m[logSheetHeaders.indexOf("LOG ID")]).flat();
  const newRows = [];

  const orderPropsName = "carpetOrderNumber";
  const props = PropertiesService.getScriptProperties();
  const previousOrderNumber = props.getProperty(orderPropsName);
  const thisOrderNumber = Number(previousOrderNumber) + 1;
  const amountItems = Number(formData.amountItems.value);
  const { userEmail: creatorEmail, userName } = JSON.parse(getEffectiveUser());
  // const { userEmail: creatorEmail, userName } = getEffectiveUser();
  const emailSubject = `New Carpet Sample Check-out:  ${thisOrderNumber}`;

  let emailContent = `SUBMITTED BY:\n%SUBMITTED BY%\n\n${clientInfoTemplate}\n\nDELIVERY METHOD: %DELIVERY METHOD%`;
  let includeDeliveryInfo = false;

  formData["DELIVERY METHOD"] = formData["DELIVERY METHOD"] || { value: "", id: "" };
  formData["DATE REQUESTED"] = { value: new Date(), id: "", logId: "DATE REQUESTED" };
  formData["ORDER NUMBER"] = { value: thisOrderNumber, id: "", logId: "ORDER NUMBER" };
  formData["SUBMITTED BY"] = { value: userName, id: "", logId: "SUBMITTED BY" };
  formData["CHECK STATUS"] = { value: "checked out", id: "", logId: "CHECK STATUS" };
  formData["CHECK DATE"] = { value: new Date(), id: "", logId: "CHECK DATE" };

  // loop through for basic email replacements
  for (let d in formData) {
    let value = formData[d].value;

    if (d.indexOf("DELIVERY") > -1 && !includeDeliveryInfo && value && d != "DELIVERY METHOD") {
      includeDeliveryInfo = true;
      emailContent += `\n\n${deliveryInfoTemplate}`;
      Logger.log(`found delivery: ${d}, ${value}`)
    }

    emailContent = emailContent.replace(new RegExp(`%${d}%`, "g"), value);
  };

  // loop through for items replacements and to create a new row for the log
  for (let i = 1; i <= amountItems; i++) {
    let itemTemplate = i == 1 ? itemInfoTemplate : itemInfoTemplate.replace(/-1/g, `-${i}`);
    let newLogId = findNextUniqueNumber(logIdsList);
    let appendArray = [newLogId];

    logIdsList.push(newLogId);

    for (let d in formData) {
      let { value, logId } = formData[d];

      itemTemplate = itemTemplate.replace(new RegExp(`%${d}%`, "g"), value);

      // here, only grab the right items
      if (!meetsCriteria(d, i)) continue;

      // here, loop through every header in the log sheet to create a new row
      logSheetHeaders.forEach((header, hi) => {
        if (header == logId) appendArray[hi] = value;
      })
    };

    emailContent += `\n\n${itemTemplate}`;
    newRows.push(appendArray);
  };

  //send email 
  MailApp.sendEmail(
    // `morgan@templestudiony.com, ${creatorEmail}`,
    "daniel@templestudiony.com",
    emailSubject,
    emailContent,
    { name: "Carpet Sample Update" }
  );

  console.log(newRows);

  // Add new rows to log
  const numNewRows = newRows.length;
  if (formData.checkType === "carpet-sample-page" && numNewRows) {
    const numCols = newRows[0].length;
    logSheet.getRange(
      logSheet.getLastRow() + 1,
      1,
      numNewRows,
      numCols
    ).setValues(newRows);

    props.setProperty(orderPropsName, thisOrderNumber);
  }

  // Populate the outreach sheet
  if (formData["PACKAGE TYPE"].value === 'Outreach') {
    const orderItems = newRows.map(row => row[logSheetHeaders.indexOf('COMPLETE SAMPLE ITEM NAME')]).flat();
    populateOutreachSheet(formData, orderItems)
  } else if (formData["PACKAGE TYPE"] === 'Client Request') {
    // console.log('client request');
  }
}

function populateOutreachSheet(formData, orderItems) {
  const clientInteractionsSSId = '1k84zla-XODFWWhPH0rvFG3TIo0VipZjMik_QAt_3kNA';
  const clientInteractionsSS = SpreadsheetApp.openById(clientInteractionsSSId);
  const userName = formData["SUBMITTED BY"].value;
  const outreachSheet = clientInteractionsSS.getSheetByName(`OUTREACH - ${userName}`);

  if (!outreachSheet) {
    return;
  }

  const nameSheet = clientInteractionsSS.getSheetByName('NAMES');
  const nameData = nameSheet.getDataRange().getDisplayValues();
  const lastNames = Object.fromEntries(nameData);
  const fullName = lastNames[userName] ?
    `${userName} ${lastNames[userName]}`:
    `${userName} ${MISSING}`;

  const row = [
    'Curated Sample Package',
    new Date(formData["CHECK DATE"].value).toLocaleDateString(),
    fullName,
    formData["CLIENT NAME"].value,
    formData["CLIENT CONTACT NAME"].value,
    formData["CLIENT CONTACT EMAIL"].value,
    orderItems.join(', ')
  ];
  outreachSheet.appendRow(row);
}

function findNextUniqueNumber(numbers) {
  // Sort the array in ascending order
  numbers.sort((a, b) => a - b);

  let nextNumber = 1; // Start with the lowest possible number

  for (const number of numbers) {
    if (number === nextNumber) {
      nextNumber++; // Increment if the number is found in the list
    } else if (number > nextNumber) {
      break; // Break the loop if a gap is found
    }
  }

  return nextNumber;
}

function meetsCriteria(itemId, currentItemIndex) {
  // Create a regular expression pattern to match strings ending with a hyphen and a digit
  const regex = /-(\d+)$/;

  // Test if the string matches the pattern
  const match = itemId.match(regex);

  if (!match) {
    // No hyphen and number at the end, so it meets the criteria
    return true;
  }

  // Extract the matched number
  const matchedNumber = parseInt(match[1]);

  // Check if the matched number equals the target number
  return matchedNumber === currentItemIndex;
}





/********************************************TEMPLATES FOR EMAIL ****************************************** */
var clientInfoTemplate = `CLIENT INFO
Client Name: %CLIENT NAME%
Contact: %CLIENT CONTACT NAME%
Contact Email: %CLIENT CONTACT EMAIL%`;

var deliveryInfoTemplate = `DELIVER TO
%DELIVER TO NAME%
Attn: %DELIVER TO CONTACT NAME%
%DELIVER TO STREET ADDRESS%
%DELIVER TO CITY%, %DELIVER TO STATE%, %DELIVER TO ZIP%`;

var itemInfoTemplate = `ITEM-1
Mill: %MILL-1%
Design: %DESIGN-1%
Color: %COLOR-1%
Size: %SIZE-1%`;









