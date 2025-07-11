function getQuoteFolder() {
  const QUOTE_FOLDER_ID = '1eGe94xZv9f84ItEiEjdOeH538t9LrWoV';
  return DriveApp.getFolderById(QUOTE_FOLDER_ID);
}

function uploadQuote(quote) {
  const quotePdf = saveQuoteToDrive(quote);
  const quoteDriveFile = convertQuotePdfToDoc(quotePdf);
  const quoteDoc = DocumentApp.openById(quoteDriveFile.id);
  // const quoteDoc = DriveApp.getFileById(quoteDriveFile.id);

  const allQuoteText = quoteDoc.getBody().getText();
  const quoteInfo = extractQuoteInfo(allQuoteText);
  quoteDriveFile.setTrashed(true);

  return { driveId: quotePdf.getId() , ...quoteInfo }
}

function saveQuoteToDrive(quote) {
  const quoteBlob = Utilities.newBlob(
    Utilities.base64Decode(quote.data),
    quote.mimeType,
    quote.fileName
  );
  
  const quoteFolder = getQuoteFolder();
  const driveQuote = quoteFolder.createFile(quoteBlob);
  driveQuote.setOwner('payments@templestudiony.com');

  return driveQuote
}

function convertQuotePdfToDoc(quotePdf) {
  return Drive.Files.copy(
    { title: quotePdf.getName().replace(".pdf", ""), mimeType: MimeType.GOOGLE_DOCS },
    quotePdf.getId(),
    { ocr: true }
  );
}

// function testExtract() {
//   const propName = 'quote106pw';
//   const quoteText = PropertiesService.getScriptProperties().getProperty(propName);
//   console.log(quoteText);

//   const quoteInfo = extractQuoteInfo(quoteText);
//   console.log(quoteInfo);
// }

function extractQuoteInfo(allQuoteText) {
  const quoteInfo = {};
  const hasSidemark = (line) => line.includes("Sidemark:") || line.includes("Side mark:") || line.includes("SideMark:") || line.includes("Side Mark:");
  
  if (allQuoteText.includes("\n")) {
    const lines = allQuoteText.split("\n").map(line => line.trim());
    lines.forEach((line, idx) => {
      // Logger.log(line);

      // Quote Number and Sidemark
      if (!Object.hasOwn(quoteInfo, 'quote-number') && line.includes("No.")) {
        const quoteNum = line.split(" ").pop();
        quoteInfo['quote-number'] = quoteNum;
        
        const sidemarkLine = lines[idx + 1];
        if (!Object.hasOwn(quoteInfo, 'sidemark') && sidemarkLine) {
          let sidemark = sidemarkLine;
          const pageNumMatch = sidemark.match(/Page 1 of \d+ (.+)/);
          if (pageNumMatch) {
            sidemark = pageNumMatch[1].trim();
          }

          if (sidemark.includes("Your Order No.")) {
            sidemark = sidemark.split("Your Order No.")[0].trim();
          }

          quoteInfo['sidemark'] = sidemark;
        }
      }

      // Another try at sidemark
      if (!Object.hasOwn(quoteInfo, 'sidemark') && hasSidemark(line)) {
        const words = line.split(" ");
        const sidemarkWords = [];
        let sidemarkSeen = false;
        for (const word of words) {
          if (word === 'Sidemark:') {
            sidemarkSeen = true;
            continue;
          }
          if (!sidemarkSeen) continue;
          if (isNaN(word[0])) {
            sidemarkWords.push(word);
          } else {
            break;
          }
        }
        quoteInfo['sidemark'] = sidemarkWords.join(" ");
      }

      // Client Name
      if (!Object.hasOwn(quoteInfo, 'client-name') && line.includes("To:")) {
        const words = line.split(" ");
        const clientNameWords = [];
        let toSeen = false;
        for (const word of words) {
          if (word === "To:") {
            toSeen = true;
            continue;
          }
          if (!toSeen) continue;
          if (isNaN(word[0]) || clientNameWords.length === 0) {
            clientNameWords.push(word);
          } else {
            break;
          }
        }
        quoteInfo['client-name'] = clientNameWords.join(" ");
      }

      // Requested Deposit
      if (!Object.hasOwn(quoteInfo, 'requested-deposit') && line.includes("Requested Deposit")) {
        const reqDeposit = line.split(" ").pop();
        quoteInfo['requested-deposit'] = reqDeposit;
      }

      // Another try at Requested Deposit
      if (!Object.hasOwn(quoteInfo, 'requested-deposit') && line.includes("Balance:")) {
        const reqDeposit = line.split("Balance:").pop().trim();
        quoteInfo['requested-deposit'] = reqDeposit;
      }
    });
  }
  
  else if (allQuoteText.includes(". ")) {
    const paragraphs = allQuoteText.split(". ");
    // paragraphs.forEach(p => Logger.log(p))
    paragraphs.forEach((para, idx) => {
      // Quote Number
      if (!Object.hasOwn(quoteInfo, 'quote-number') && para.includes("Quote No")) {
        const quoteNumPara = paragraphs[idx + 1];
        const quoteNum = quoteNumPara.split(" ")[0];
        quoteInfo['quote-number'] = quoteNum;

        const sidemarkLine = paragraphs[idx + 1];
        if (!Object.hasOwn(quoteInfo, 'sidemark') && sidemarkLine) {
          let sidemark = sidemarkLine;
          const pageNumMatch = sidemark.match(/Page 1 of \d+ (.+)/);
          if (pageNumMatch) {
            sidemark = pageNumMatch[1].trim();
          }

          if (sidemark.includes("Your Order No.")) {
            sidemark = sidemark.split("Your Order No.")[0].trim();
          }

          quoteInfo['sidemark'] = sidemark;
        }
      }

      // Client Name
      if (!Object.hasOwn(quoteInfo, 'client-name') && para.includes("To:")) {
        const words = para.split(" ");
        const clientNameWords = [];
        let toSeen = false;
        for (const word of words) {
          if (word === 'To:') {
            toSeen = true;
            continue;
          }
          if (!toSeen) continue;
          if (isNaN(word[0]) || clientNameWords.length === 0) {
            clientNameWords.push(word);
          } else {
            break;
          }
        }
        quoteInfo['client-name'] = clientNameWords.join(" ");
      }

      // Sidemark
      if (!Object.hasOwn(quoteInfo, 'sidemark') && hasSidemark(para)) {
        const words = para.split(" ");
        const sidemarkWords = [];
        let sidemarkSeen = false;
        for (const word of words) {
          if (word === 'Sidemark:') {
            sidemarkSeen = true;
            continue;
          }
          if (!sidemarkSeen) continue;
          if (isNaN(word[0])) {
            sidemarkWords.push(word);
          } else {
            break;
          }
        }
        quoteInfo['sidemark'] = sidemarkWords.join(" ");
      }

      // Requested Deposit
      if (!Object.hasOwn(quoteInfo, 'requested-deposit') && para.includes("Requested Deposit")) {
        const reqDeposit = para.split(" ").pop();
        quoteInfo['requested-deposit'] = reqDeposit;
      }

      // Another try at Requested Deposit
      if (!Object.hasOwn(quoteInfo, 'requested-deposit') && para.includes("Balance:")) {
        const reqDeposit = para.split("Balance:").pop().trim();
        quoteInfo['requested-deposit'] = reqDeposit;
      }
    });
  }

  else {
    Logger.log("Couldn't find any paragraphs or lines in the quote");
    return null;
  }

  return quoteInfo;
}

