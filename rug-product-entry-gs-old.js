// function getRugDatabaseInfoOld(desiredHeaders) {
//   const productDatabaseId = 0;
//   const ss = SpreadsheetApp.openById(rugDatabaseSSId);
//   const productSheet = ss.getSheets().find(
//     sheet => sheet.getSheetId() === productDatabaseId
//   );;

//   const data = productSheet.getDataRange().getDisplayValues();
//   const headers = data.shift().map(hdr => hdr.toLowerCase());

//   const desiredHeadersSet = new Set(desiredHeaders.map(hdr => hdr.toLowerCase()));
//   const databaseInfo = {
//     rows: {},
//     codes: {},
//   }
//   for (const row of data) {
//     const rowObj = row.reduce((acc, curr, i) => {
//       const header = headers[i];
//       if (desiredHeadersSet.has(header)) {
//         acc[header] = curr;
//       }
//       return acc;
//     }, {});
    
//     const dmCode = rowObj["temple sku/dm code"];
//     const batchCode = rowObj["unique sample batch code"];
    
//     if (Object.hasOwn(databaseInfo.rows, dmCode)) {
//       databaseInfo.rows[dmCode][batchCode] = rowObj;
//     } else {
//       databaseInfo.rows[dmCode] = { [batchCode]: rowObj }
//     }

//     if (Object.hasOwn(databaseInfo.codes, dmCode)) {
//       databaseInfo.codes[dmCode].push(batchCode);
//     } else {
//       databaseInfo.codes[dmCode] = [batchCode];
//     }
//   }

//   return JSON.stringify(databaseInfo);
// }

// Mock data
const mockData = [
  {
    mode: 'create',
    formValues: {
      'MILL DESIGN NAME': 'mill design',
      'PRICE RANGE MAX': '',
      'CUSTOM STRIKE-OFF FEE PRICE': '',
      'STATUS': 'active',
      'CONSTRUCTION': 'construction',
      'COST RANGE MAX': '',
      'TEMPLE COLORWAY NAME': 'color',
      'PILE HEIGHT 1': '',
      'ROYALTY BASIS COLUMN 1': '',
      'MAX WIDTH FEET (OPTION 1)': '',
      'IMAGE 1': '',
      'PRODUCT CATEGORY': 'custom',
      'POM NUMBERS': '',
      'COST UNIT OF MEASURE 1': 'Square Foot',
      'undefined': '',
      'PRICE UNIT OF MEASURE 1': '',
      'STANDARD LEAD TIME': 'lead time',
      'STRIKE-OFF LEAD TIME': '',
      'IMAGE 1 TYPE': '',
      'PRICE 1 REASON': '',
      'UNIQUE SAMPLE BATCH CODE': 'skuh-001',
      'NOTES TO CONSIDER': '',
      'MILL DESIGN NUMBER OPTION 1 REASON': '',
      'VENDOR COMMISSION': '',
      'COLOR 1': '',
      'RUG/CARPET STYLE 1': '',
      'MAX WIDTH INCHES (OPTION 1)': '',
      'PRICE RANGE UNIT OF MEASURE': '',
      'Miscellaneous Item Reference': '',
      'TEMPLE SKU/DM CODE': 'skuh',
      'CONTENT 1': 'fiber',
      'MILL DESIGN NUMBER OPTION 2 REASON': '',
      'ROYALTY': '',
      'MINIMUM ORDER QTY': '',
      'Content Version': '',
      'MILL': 'mill',
      'CUSTOM STRIKE-OFF FEE COST': '',
      'Version Number': '',
      'MILL DESIGN NUMBER OPTION 1': '',
      'PRICE RANGE MIN': '',
      'ON WEBSITE': 'yes',
      'MILL COLORWAY NAME': 'mill colorway',
      'COST 1 (FIXED)': '$5.00',
      'COST RANGE MIN': '',
      'SAMPLE INVENTORY SIZE 1': '',
      'COUNTRY OF ORIGIN': 'Afghanistan',
      'VENDOR COMISSION BASIS COLUMN 1': '',
      'Temple PO reference': '',
      'COST RANGE UNIT OF MEASURE': '',
      'TEMPLE DESIGN NAME': 'design',
      'COST 1 REASON': '',
      'PRICE 1 (FIXED)': '',
      'DESIGN MOTIF 1': '',
      'IN DM': 'yes'
    }
  },
  {
    mode: 'create',
    formValues: {
      royalty: '',
      'standard lead time': 'lead time',
      'cost range max': '',
      'quantity on loan': '',
      'product category': 'custom',
      'cost range min': '',
      'price (fixed) 1': '',
      'price range unit of measure': '',
      'cost reason 1': '',
      'max width feet 1': '',
      'temple sku/dm code': 'sku',
      'price reason 1': '',
      mill: 'mill',
      'price unit of measure 1': '',
      'image 1': '',
      'mill design number option 2 reason': '',
      'mill design number option 1 reason': '',
      'color 1': '',
      'unique sample batch code': 'batch',
      'quantity on hand': '5',
      'cost (fixed) 1': '5',
      'version number': '',
      'image type 1': '',
      'price range min': '',
      'mill design number (option 1)': '',
      'design motif 1': '',
      'mill colorway name': 'mill colorway',
      'price range max': '',
      'max width inches 1': '',
      status: 'active',
      'content 2': 'More fiber',
      'royalty basis column 1': '',
      'mill design number (option 2)': '',
      'temple po reference': '',
      'cost range unit of measure': '',
      'custom strike-off fee cost': '',
      'quantity total': '5',
      'in dm': 'yes',
      'mill design name': 'mill design',
      'sample inventory size 2': '6x6',
      'freight cost per sq. ft.': '',
      'on website': 'yes',
      'country of origin': 'Afghanistan',
      'strike off-lead time': '',
      'content version': '',
      'temple colorway name': 'color',
      'complete sample item name': '',
      'content 1': 'fiber',
      'minimum order qty': '',
      construction: 'construction',
      'sample inventory size 1': '1x1',
      'miscellaneous item reference': '',
      'cost unit of measure 1': 'unit',
      'temple design name': 'design',
      'pom numbers': '',
      'pile height (in mm) 1': '5',
      'pile height (in mm) 2': '10',
      'custom strike-off fee price': '',
      'freight price per sq. ft.': '',
      'notes to consider': 'farty fart fartson',
      'rug/carpet style 1': ''
    },
  }
] 

/**
 * Submit data
 */
function processSubmittedRugData(formData) {
  console.log(formData);
  const { mode, formValues } = formData;
  
  const productDatabaseId = 0;
  const ss = SpreadsheetApp.openById(rugDatabaseSSId);
  const productSheet = ss.getSheets().find(
    sheet => sheet.getSheetId() === productDatabaseId
  );

  if (mode === 'create') {
    const lastColNum = productSheet.getLastColumn();
    const headersRange = productSheet.getRange(1, 1, 1, lastColNum);
    const headers = headersRange.getDisplayValues().flat().map(hdr => hdr.toLowerCase());

    const lastRowNum = productSheet.getLastRow();
    const lastRowRange = productSheet.getRange(lastRowNum, 1, 1, lastColNum);
    productSheet.insertRowAfter(lastRowNum);
    lastRowRange.copyTo(productSheet.getRange(lastRowNum + 1, 1));

    const newRowRange = productSheet.getRange(lastRowNum + 1, 1, 1, lastColNum);
    const newRowData = { fullRow: {} };
    for (let colNum = 1; colNum <= lastColNum; colNum++) {
      const header = headers[colNum - 1];
      const newRowCell = newRowRange.getCell(1, colNum);

      if (Object.hasOwn(formValues, header)) {
        newRowCell.setValue(formValues[header]);
        newRowData.fullRow[header] = formValues[header];
      } else {
        newRowCell.clearContent();
        newRowData.fullRow[header] = '';
      }
    }

    const skuCol = headers.indexOf('temple sku/dm code') + 1;
    const uniqueBatchCol = headers.indexOf('unique sample batch code') + 1;
    productSheet.getDataRange().sort([skuCol, uniqueBatchCol]);

    if (Object.hasOwn(formValues, 'sample inventory size 1')) {
      const samplesArr = createSampleRows(formValues);
      newRowData.samples = samplesArr;
    }

    const skipTheseHeaders = new Set(['samples', 'fullRow']);
    for (let i = 1; i <= 12; i++) {
      skipTheseHeaders.add(`sample inventory size ${i}`);
    }
    for (const header in newRowData.fullRow) {
      if (skipTheseHeaders.has(header)) {
        continue;
      }

      const headerWords = header.split(' ');
      const lastPart = headerWords.pop();
      const headerVal = newRowData.fullRow[header];
      if (Number.isNaN(Number(lastPart))) {
        newRowData[header] = headerVal;
        continue;
      }
      
      let genHeader = headerWords.join(' ');
      switch(genHeader) {
        case 'max width inches':
        case 'max width feet': {
          genHeader = 'max widths';
          break;
        }
        
        case 'cost (fixed)':
        case 'price (fixed)':
        case 'cost unit of measure':
        case 'price unit of measure':
        case 'cost reason':
        case 'price reason': {
          genHeader = 'prices and costs'
          break;
        }

        case 'image':
        case 'image primary':
        case 'image type': {
          genHeader = 'images';
          break;
        }
      }

      const headerValueObject = { [header]: headerVal };
      if (Object.hasOwn(newRowData, genHeader)) {
        newRowData[genHeader].push(headerValueObject);
      } else {
        newRowData[genHeader] = [headerValueObject];
      }
    }

    return JSON.stringify({
      codes: {
        sku: formValues['temple sku/dm code'],
        batch: formValues['unique sample batch code'],
      },
      newRow: newRowData,
    });
  }
  
  else if (mode === 'clone') {

  }
  
  else if (mode === 'edit') {

  }
}

function createSampleRows(formValues) {}

// function processSubmittedRugDataOld(formData) {
//   const { mode, formValues } = formData;
//   console.log(formData);

//   // Found in the url as the 'gid'
//   const productSheetId = 0;
//   const sampleSheetId = 348173125;

//   const allRugSheets = SpreadsheetApp.openById(rugDatabaseSSId).getSheets();
//   const productSheet = allRugSheets.find(sheet => sheet.getSheetId() === productSheetId);
//   const sampleSheet = allRugSheets.find(sheet => sheet.getSheetId() === sampleSheetId);
  
//   const { headers: productHeaders, data: productData } = getSheetData(productSheet, 'TEMPLE SKU/DM CODE', 'UNIQUE SAMPLE BATCH CODE');
//   const { headers: sampleHeaders, data: sampleData } = getSheetData(sampleSheet, 'TEMPLE SKU/DM CODE', 'SIZE');

//   const newRowObj = {};
//   if (mode === 'create') {
//     const newProductRow = productHeaders.map(header => {
//       if (Object.hasOwn(formValues, header)) {
//         return formValues[header];
//       }
//       return '';
//     });
//     productSheet.appendRow(newProductRow);
//     productSheet.getDataRange().sort([
//       productHeaders.indexOf('temple sku/dm code') + 1,
//       productHeaders.indexOf('unique sample batch code') + 1,
//     ]);

//     if (Object.hasOwn(formValues, 'sample inventory size 1')) {
//       createSampleRows(formValues);
//     }
//   }

//   else if (mode === 'clone') {}
//   else if (mode === 'edit') {}

//   return JSON.stringify({
//     codes: {
//       sku: formValues['TEMPLE SKU/DM CODE'.toLowerCase()],
//       batch: formValues['UNIQUE SAMPLE BATCH CODE'.toLowerCase()],
//     },
//     newRow: newRowObj,
//   });
// }












/**
 * Working
 */
// function getRugDatabaseInfo() {
//   // Found in the url as the 'gid'
//   const productSheetId = 0;
//   const sampleSheetId = 348173125;

//   const allRugSheets = SpreadsheetApp.openById(rugDatabaseSSId).getSheets();
//   const productSheet = allRugSheets.find(sheet => sheet.getSheetId() === productSheetId);
//   const sampleSheet = allRugSheets.find(sheet => sheet.getSheetId() === sampleSheetId);
  
//   const { data: productData } = getSheetData(productSheet, 'TEMPLE SKU/DM CODE', 'UNIQUE SAMPLE BATCH CODE');
//   const { data: sampleData } = getSheetData(sampleSheet, 'TEMPLE SKU/DM CODE', 'SIZE');
//   const databaseInfo = {
//     rows: {},
//     codes: {}
//   }

//   for (const sku in productData) {
//     for (const batch in productData[sku]) {
//       if (Object.hasOwn(databaseInfo.codes, sku)) {
//         databaseInfo.codes[sku].push(batch);
//       } else {
//         databaseInfo.codes[sku] = [batch];
//       }

//       const { row: productRow } = productData[sku][batch];
//       if (Object.hasOwn(databaseInfo.rows, sku)) {
//         databaseInfo.rows[sku][batch] = { fullRow: productRow };
//       } else {
//         databaseInfo.rows[sku] = { [batch]: { fullRow: productRow } };
//       }

//       for (const header in productRow) {
//         const headerWords = header.split(' ');
//         const lastPart = headerWords.pop();
//         if (Number.isNaN(Number(lastPart))) {
//           databaseInfo.rows[sku][batch][header] = productRow[header];
//           continue;
//         }
        
//         let genHeader = headerWords.join(' ');
//         let isSampleHeader = false;
//         switch(genHeader) {
//           case 'max width inches':
//           case 'max width feet': {
//             genHeader = 'max widths';
//             break;
//           }
          
//           case 'cost (fixed)':
//           case 'price (fixed)':
//           case 'cost unit of measure':
//           case 'price unit of measure':
//           case 'cost reason':
//           case 'price reason': {
//             genHeader = 'prices and costs'
//             break;
//           }

//           case 'sample inventory size': {
//             isSampleHeader = true;
//             genHeader = 'samples';
//             break;
//           }

//           case 'image':
//           case 'image primary':
//           case 'image type': {
//             genHeader = 'images';
//             break;
//           }
//         }

//         const headerValueObject = { [header]: productRow[header] };
//         if (isSampleHeader) {
//           const sampleSize = productRow[header];
//           if (sampleSize) {
//             const { row: sampleRow } = sampleData[sku][sampleSize];

//             headerValueObject[`size ${lastPart}`] = sampleSize;
//             for (const sampleHeader of ['complete sample item name', 'quantity total', 'quantity on loan', 'quantity on hand']) {
//               const objectProp = `${sampleHeader} ${lastPart}`;
//               headerValueObject[objectProp] = sampleRow[sampleHeader];
//               databaseInfo.rows[sku][batch].fullRow[objectProp] = sampleRow[sampleHeader];
//             }
//           }
//         }

//         if (Object.hasOwn(databaseInfo.rows[sku][batch], genHeader)) {
//           databaseInfo.rows[sku][batch][genHeader].push(headerValueObject);
//         } else {
//           databaseInfo.rows[sku][batch][genHeader] = [headerValueObject];
//         }
//       }
//     }
//   }

//   console.log(databaseInfo);

//   return JSON.stringify(databaseInfo);
// }

function getRugDatabaseInfo() {
  // Found in the url as the 'gid'
  const productSheetId = 0;
  const sampleSheetId = 348173125;

  const allRugSheets = SpreadsheetApp.openById(rugDatabaseSSId).getSheets();
  const productSheet = allRugSheets.find(sheet => sheet.getSheetId() === productSheetId);
  const sampleSheet = allRugSheets.find(sheet => sheet.getSheetId() === sampleSheetId);
  
  const { data: productData } = getSheetData(productSheet, 'TEMPLE SKU/DM CODE', 'UNIQUE SAMPLE BATCH CODE');
  const { data: sampleData } = getSheetData(sampleSheet, 'TEMPLE SKU/DM CODE', 'SIZE');
  const databaseInfo = {
    rows: {},
    codes: {}
  }

  for (const sku in productData) {
    for (const batch in productData[sku]) {
      if (Object.hasOwn(databaseInfo.codes, sku)) {
        databaseInfo.codes[sku].push(batch);
      } else {
        databaseInfo.codes[sku] = [batch];
      }

      const { row: productRow } = productData[sku][batch];
      if (Object.hasOwn(databaseInfo.rows, sku)) {
        databaseInfo.rows[sku][batch] = { fullRow: productRow };
      } else {
        databaseInfo.rows[sku] = { [batch]: { fullRow: productRow } };
      }

      for (const header in productRow) {
        const headerWords = header.split(' ');
        const lastPart = headerWords.pop();
        if (Number.isNaN(Number(lastPart))) {
          if (lastPart === 'inventory') {
            // const sampleInfo = {
            //   'complete sample item name': null,
            //   'quantity total': null,
            //   'quantity on hand': null,
            //   'quantity on loan': null,
            // }
            const sampleInfo = {}

            const sampleSize = headerWords[0];
            const { row: sampleRow } = sampleData[sku][sampleSize];

            if (Object.hasOwn(databaseInfo.rows[sku][batch], 'samples')) {

            }            

            // if (isSampleHeader) {
        //   const sampleSize = productRow[header];
        //   if (sampleSize) {
        //     const { row: sampleRow } = sampleData[sku][sampleSize];

        //     headerValueObject[`size ${lastPart}`] = sampleSize;
        //     for (const sampleHeader of ['complete sample item name', 'quantity total', 'quantity on loan', 'quantity on hand']) {
        //       const objectProp = `${sampleHeader} ${lastPart}`;
        //       headerValueObject[objectProp] = sampleRow[sampleHeader];
        //       databaseInfo.rows[sku][batch].fullRow[objectProp] = sampleRow[sampleHeader];
        //     }
        //   }
        // }
          } else {
            databaseInfo.rows[sku][batch][header] = productRow[header];
          }
          continue;
        }
        
        let genHeader = headerWords.join(' ');
        // let isSampleHeader = false;
        switch(genHeader) {
          case 'max width inches':
          case 'max width feet': {
            genHeader = 'max widths';
            break;
          }
          
          case 'cost (fixed)':
          case 'price (fixed)':
          case 'cost unit of measure':
          case 'price unit of measure':
          case 'cost reason':
          case 'price reason': {
            genHeader = 'prices and costs'
            break;
          }

          // case 'sample inventory size': {
          //   isSampleHeader = true;
          //   genHeader = 'samples';
          //   break;
          // }

          case 'image':
          case 'image primary':
          case 'image type': {
            genHeader = 'images';
            break;
          }
        }

        
        // if (isSampleHeader) {
        //   const sampleSize = productRow[header];
        //   if (sampleSize) {
        //     const { row: sampleRow } = sampleData[sku][sampleSize];

        //     headerValueObject[`size ${lastPart}`] = sampleSize;
        //     for (const sampleHeader of ['complete sample item name', 'quantity total', 'quantity on loan', 'quantity on hand']) {
        //       const objectProp = `${sampleHeader} ${lastPart}`;
        //       headerValueObject[objectProp] = sampleRow[sampleHeader];
        //       databaseInfo.rows[sku][batch].fullRow[objectProp] = sampleRow[sampleHeader];
        //     }
        //   }
        // }

        const headerValueObject = { [header]: productRow[header] };
        if (Object.hasOwn(databaseInfo.rows[sku][batch], genHeader)) {
          databaseInfo.rows[sku][batch][genHeader].push(headerValueObject);
        } else {
          databaseInfo.rows[sku][batch][genHeader] = [headerValueObject];
        }
      }
    }
  }

  console.log(databaseInfo);

  return JSON.stringify(databaseInfo);
}

function getImageDataFor(millName) {
  const allImageFolders = DriveApp.getFolderById('1MydVCYP6IKlb6pd08moloAQ1loYk3eEp');
  const subfolderIterator = allImageFolders.getFolders();
  if (!subfolderIterator.hasNext()) {
    throw new Error(`The folder ${allImageFolders.getName()} is empty`);
  }

  let imageFolder;
  while (subfolderIterator.hasNext()) {
    const folder = subfolderIterator.next();
    if (folder.getName().toLowerCase() === millName.toLowerCase()) {
      imageFolder = folder;
      break;
    }
  }
  if (!imageFolder) {
    throw new Error(`Could not find folder with mill name ${millName}`);
  }

  const imageIterator = imageFolder.getFiles();
  if (!imageIterator.hasNext()) {
    throw new Error(`The folder with mill name ${millName} is empty`);
  }

  const allImages = [];
  while (imageIterator.hasNext()) {
    const image = imageIterator.next();
    const fullName = image.getName().split('.')[0];

    let name = fullName;
    if (fullName.includes('-')) {
      const nameWords = fullName.split(' - ');
      if (nameWords.length > 2) {
        name = `${nameWords[1]} - ${nameWords[2]}`;
      }
    }

    allImages.push({
      name: name,
      id: image.getId()
    });
  }

  allImages.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    } else if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

  return JSON.stringify(allImages);
}

function getSheetData(sheet, firstIdentifier, secondIdentifier) {
  const allData = sheet.getDataRange().getDisplayValues();
  const headers = allData.shift().map(hdr => hdr.toLowerCase());

  const data = allData.reduce((acc, curr, i) => {
    const rowNum = i + 2; // Header row removed and GS is 1-indexed
    const firstId = curr[headers.indexOf(firstIdentifier.toLowerCase())];
    const secondId = curr[headers.indexOf(secondIdentifier.toLowerCase())];

    const row = curr.reduce((acc, curr, i) => {
      acc[headers[i]] = curr;
      return acc;
    }, {});
    const rowData = { rowNum, row }

    if (Object.hasOwn(acc, firstId)) {
      acc[firstId][secondId] = rowData;
    } else {
      acc[firstId] = { [secondId]: rowData };
    }
    return acc;
  }, {})

  return { headers, data };
}

function getRugDropdownValues() {
  const ss = SpreadsheetApp.openById(rugDatabaseSSId);
  const dataValidationDirectoryId = 1522990621;
  const dataValidationDirectory = ss.getSheets().find(
    sheet => sheet.getSheetId() === dataValidationDirectoryId
  );

  const dvdData = dataValidationDirectory.getDataRange().getDisplayValues();
  const dvdHeaders = dvdData.shift().map(header => header.toLowerCase());

  const dropdownVals = {};
  for (const hdr of dvdHeaders) {
    dropdownVals[hdr] = [];
  }
  for (const row of dvdData) {
    row.forEach((val, i) => {
      if (val) {
        dropdownVals[dvdHeaders[i]].push(val);
      }
    });
  }

  return JSON.stringify(dropdownVals);
}