function getLastUpdatedTime() {
  const scriptProps = PropertiesService.getScriptProperties();
  const lastUpdated = scriptProps.getProperty('lastUpdated');

  if (lastUpdated) return lastUpdated;

  const now = String(new Date().getTime());
  scriptProps.setProperty('lastUpdated', now);
  return now;
}

function setLastUpdateTime() {
  const scriptProps = PropertiesService.getScriptProperties();
  const now = String(new Date().getTime());
  
  scriptProps.setProperty('lastUpdated', now);
  return now;
}

function getAllSheets() {
  const allSheets = SpreadsheetApp.openById('1imNb5MJhYuqyAFAzRTkX3c7CC2mGMH413gIEvOMknnc').getSheets();  // To do: This is the testing sheet ID, change it when moving to prod
  return allSheets;
}

function deleteDuplicates() {
  const productDatabaseId = 0;
  const sampleDatabaseId = 348173125;

  const allSheets = getAllSheets();
  const prodAndSampSheets = allSheets.filter(sheet => {
    const isProduct = sheet.getSheetId() === productDatabaseId;
    const isSample = sheet.getSheetId() === sampleDatabaseId;
    return isProduct || isSample;
  })

  prodAndSampSheets.forEach(sheet => {
    const sheetData = sheet.getDataRange().getDisplayValues();
    const sheetHeaders = sheetData.shift();

    const deleteIdx = sheetHeaders.indexOf('Delete');
    const skuIdx = sheetHeaders.indexOf('Temple SKU/DM Code');
    const batchIdx = sheetHeaders.indexOf('Unique Sample Batch Code');
    const sortedAndNoDuplicates = sheetData.filter(row => {
      const deleteVal = row[deleteIdx];
      return deleteVal !== 'Yes';
    }).sort((row1, row2) => {
      const [sku1, sku2] = [row1[skuIdx], row2[skuIdx]];
      if (sku1 < sku2) {
        return -1
      } else if (sku1 > sku2) {
        return 1
      }

      const [batch1, batch2] = [row1[batchIdx], row2[batchIdx]];
      if (batch1 < batch2) {
        return -1
      } else if (batch1 > batch2) {
        return 1
      }

      console.warn("Possible duplicates found where they shouldn't be:");
      console.log(row1, row2);
      return 0
    });

    const cleanData = [sheetHeaders, ...sortedAndNoDuplicates];
    const newDataRange = sheet.getRange(1, 1, cleanData.length, sheetHeaders.length);
    sheet.clearContents();
    newDataRange.setValues(cleanData);
    setSheetVersionNumber(sheet.getName());
  });
}

// function getSheetVersionNumber(sheetName) {
//   const allSheets = getAllSheets();

//   const sheet = allSheets.find(s => s.getName() === sheetName);
//   const versionNumberMetadata = sheet.getDeveloperMetadata().find(
//     metadata => metadata.getKey() === 'versionNumber'
//   )
//   if (!versionNumberMetadata) {
//     const noVersionNumError = new Error(`Could not find version number metadata for ${sheetName}`);
//     throw noVersionNumError;
//   }

//   const versionNumber = versionNumberMetadata.getValue();
//   if (versionNumber !== '') {
//     return versionNumber;
//   }

//   const noVersionNumError = new Error(`Could not find version number for ${sheetName}`);
//   throw noVersionNumError;
// }

// function setSheetVersionNumber(sheetName) {
//   const allSheets = getAllSheets();

//   const sheet = allSheets.find(s => s.getName() === sheetName);
//   const versionNumberMetadata = sheet.getDeveloperMetadata().find(
//     metadata => metadata.getKey() === 'versionNumber'
//   );

//   const currentVersionNum = String(new Date().getTime());
//   if (versionNumberMetadata) {
//     versionNumberMetadata.setValue(currentVersionNum);
//   } else {
//     sheet.addDeveloperMetadata('versionNumber', currentVersionNum);
//   }

//   return Number(currentVersionNum);
// }

// These headers are not used in the portal but Temple wants to keep them in the spreadsheet
const IGNORE_THESE_HEADERS = new Set(['Edit Notes', 'Mill Price List Date', 'COMBINED PILE HEIGHT', 'COMBINED MAX WIDTH (OPTION 1)', 'COMBINED MAX WIDTH (OPTION 2)', 'COMBINED COST RANGE', 'COMBINED PRICE RANGE', 'COMBINED SAMPLE INVENTORY', 'Delete'])
const COMBINED_COLS_FORMULA = {
  'COMBINED CONTENT': {
    formula: (range) => `=TEXTJOIN(" / ", TRUE, ${range.getA1Notation()})`,
    colsToCombine: 4,
  },
}

function processSubmittedRugData(formData) {
  const { mode, formValues } = formData;

  // console.log('raw form values', formValues);

  const productDatabaseId = 0;
  const sampleDatabaseId = 348173125;

  const allSheets = getAllSheets();
  const productSheet = allSheets.find(sheet => sheet.getSheetId() === productDatabaseId);
  const sampleSheet = allSheets.find(sheet => sheet.getSheetId() === sampleDatabaseId); 

  // To do: Add in stuff here that is common to both methods for DRY

  if (mode === 'edit') {
    return editRugRow(formValues, productSheet, sampleSheet)
  } else {
    return createRugRow(formValues, productSheet, sampleSheet);
  }
}

function createRugRow(formValues, productSheet, sampleSheet) {
  // Initialize an object to return and an array for the new row
  const newProductRow = [];
  const newProductRowAsObj = { samples: [...formValues.samples] };
  
  // Extract the sample headers
  const sampleHeadersRange = sampleSheet.getRange(1, 1, 1, sampleSheet.getLastColumn()); 
  const sampleHeaders = sampleHeadersRange.getDisplayValues().flat();

  // Add sample rows to sample sheet
  for (const sampleObj of formValues.samples) {
    const newSampleRow = sampleHeaders.map(header => sampleObj[header]);
    sampleSheet.appendRow(newSampleRow);
  }

  // Update the sample sheet version number
  // const sampVerNum = setSheetVersionNumber('RUG SAMPLE DATABASE');

  // Extract the product headers
  const lastProductCol = productSheet.getLastColumn();
  const productHeadersRange = productSheet.getRange(1, 1, 1, lastProductCol);
  const productHeaders = productHeadersRange.getDisplayValues().flat();

  // Fill up newProductRow and newProductRowAsObj
  const colsToFormat = {
    imageId: [],
    combined: [],
  }
  productHeaders.forEach((header, idx) => {
    if (IGNORE_THESE_HEADERS.has(header)) {
      newProductRow.push('');
      return;
    }

    const value = formValues[header];
    const colNum = idx + 1;
    if (header.includes('Image ID') && value) {
      colsToFormat.imageId.push(colNum);
    } else if (Object.hasOwn(COMBINED_COLS_FORMULA, header)) {
      colsToFormat.combined.push(colNum);
    }
    
    newProductRow.push(value);
    newProductRowAsObj[header] = value;
  });

  // Append the new row to the product spreadsheet and add the fullRow prop to newProductRowAsObj
  productSheet.appendRow(newProductRow);
  SpreadsheetApp.flush();
  newProductRowAsObj.fullRow = { ...newProductRowAsObj };

  // Format the image id cols and the combined cols
  formatColumns(productSheet, productHeaders, colsToFormat, productSheet.getLastRow());
  
  // Update the product sheet version number
  // const prodVerNum = setSheetVersionNumber('RUG PRODUCT DATABASE');
  setLastUpdateTime();

  return JSON.stringify({
    codes: {
      sku: formValues['Temple SKU/DM Code'],
      batch: formValues['Unique Sample Batch Code'],
    },
    newProductRow: newProductRowAsObj,
    newSampleRows: formValues.samples,
    // versionNumbers: {
    //   product: prodVerNum,
    //   sample: sampVerNum
    // }
  });
}

function editRugRow(formValues, productSheet, sampleSheet) {
  // Extract the sample headers
  const totalSampleCols = sampleSheet.getLastColumn();
  const sampleHeadersRange = sampleSheet.getRange(1, 1, 1, totalSampleCols); 
  const sampleHeaders = sampleHeadersRange.getDisplayValues().flat();
  
  // Extract the sku and size columns
  const totalSampleRows = sampleSheet.getLastRow();
  const [sampleSkus, sampleSizes] = [
    sampleHeaders.indexOf('Temple SKU/DM Code') + 1,
    sampleHeaders.indexOf('Size') + 1
  ].map(colNum => {
    const colRange = sampleSheet.getRange(1, colNum, totalSampleRows, 1);
    return colRange.getDisplayValues().flat();
  });

  // Create a row number map
  const sampleRowNumMap = {}
  for (let idx = 0; idx < sampleSkus.length; idx++) {
    const sku = sampleSkus[idx];
    const size = sampleSizes[idx];

    if (Object.hasOwn(sampleRowNumMap, sku)) {
      if (Object.hasOwn(sampleRowNumMap[sku], size)) {
        sampleRowNumMap[sku][size].push(idx + 1);
      } else {
        sampleRowNumMap[sku][size] = [idx + 1];
      }
    } else {
      sampleRowNumMap[sku] = { [size]: [idx + 1] };
    }
  }

  // Edit the sample database
  for (const sampleObj of formValues.samples) {
    const sku = sampleObj['Temple SKU/DM Code'];
    const size = sampleObj['Size'];

    if (!Object.hasOwn(sampleRowNumMap, sku)) {
      const noSkuError = new Error(`Could not find a sample row with the sku ${sku}`);
      throw noSkuError
    } else if (!Object.hasOwn(sampleRowNumMap[sku], size)) {
      const noSizeError = new Error(`Could not find a sample row with the sku ${sku} and the size ${size}`);
      throw noSizeError;
    }

    const rowNums = sampleRowNumMap[sku][size].sort((a, b) => a - b);
    if (rowNums.length > 1) {
      const sampleDeleteCol = sampleHeaders.indexOf('Delete') + 1;
      for (let idx = 0; idx < rowNums.length - 1; idx++) {
        const rowNum = rowNums[idx];
        const deleteCell = sampleSheet.getCell(rowNum, sampleDeleteCol);
        deleteCell.setValue('Yes');
      }
    }

    const updatedSampleVals = sampleHeaders.map(header => sampleObj[header]);
    const rowNum = rowNums.pop();
    const sampleRowRange = sampleSheet.getRange(rowNum, 1, 1, totalSampleCols);
    sampleRowRange.setValues([updatedSampleVals]);
  }

  // Update the sample sheet version number
  // const sampVerNum = setSheetVersionNumber('RUG SAMPLE DATABASE');

  // Extract the product headers
  const totalProductCols = productSheet.getLastColumn();
  const productHeadersRange = productSheet.getRange(1, 1, 1, totalProductCols);
  const productHeaders = productHeadersRange.getDisplayValues().flat();

  // Extract the sku and size columns
  const [productSkuCol, productBatchCol] = [
    productHeaders.indexOf('Temple SKU/DM Code') + 1,
    productHeaders.indexOf('Unique Sample Batch Code') + 1
  ];
  const totalProductRows = productSheet.getLastRow();
  const productSkuRange = productSheet.getRange(1, productSkuCol, totalProductRows, 1);
  const productSkus = productSkuRange.getDisplayValues().flat();
  const productBatchRange = productSheet.getRange(1, productBatchCol, totalProductRows, 1);
  const productBatches = productBatchRange.getDisplayValues().flat();

  // Find the product row number
  const formSku = formValues['Temple SKU/DM Code'];
  const formBatch = formValues['Unique Sample Batch Code'];
  const matchingRowNums = productSkus.reduce((acc, curr, idx) => {
    const sku = curr;
    const batch = productBatches[idx];
    if (sku === formSku && batch == formBatch) {
      acc.push(idx + 1);
    }

    return acc;
  }, []);

  if (!matchingRowNums.length) {
    const noProductError = new Error(`Could not find a product row with sku ${formSku} and batch ${formBatch}`);
    throw noProductError;
  }

  // Update the matching rows
  const latestRowNum = Math.max(...matchingRowNums);
  const productDeleteCol = productHeaders.indexOf('Delete') + 1;
  const colsToFormat = {
    imageId: [],
    combined: [],
  }
  const updatedProductVals = [];
  const updatedProductRow = {};
  for (const rowNum of matchingRowNums) {
    // Case 1: We have the latest row
    if (rowNum === latestRowNum) {
      productHeaders.forEach((header, idx) => {
        if (IGNORE_THESE_HEADERS.has(header)) {
          updatedProductVals.push('');
          return;
        }
    
        const value = formValues[header];
        const colNum = idx + 1;
        if (header.includes('Image ID') && value) {
          colsToFormat.imageId.push(colNum);
        } else if (Object.hasOwn(COMBINED_COLS_FORMULA, header)) {
          colsToFormat.combined.push(colNum)
        }
    
        updatedProductVals.push(value);
        updatedProductRow[header] = value;
      });
    }
    
    // Case 2: We have an earlier duplicate row
    else {
      const deleteCell = productSheet.getRange(rowNum, productDeleteCol);
      deleteCell.setValue('Yes');
    }
  }

  const productRowRange = productSheet.getRange(latestRowNum, 1, 1, totalProductCols);
  productRowRange.setValues([updatedProductVals]);
  SpreadsheetApp.flush();
  updatedProductRow.fullRow = { ...updatedProductRow };

  formatColumns(productSheet, productHeaders, colsToFormat, latestRowNum);

  // Update the product sheet version number
  // const prodVerNum = setSheetVersionNumber('RUG PRODUCT DATABASE');
  setLastUpdateTime();

  return JSON.stringify({
    updatedProductRow: updatedProductRow,
    updatedSampleRows: formValues.samples,
    // versionNumbers: {
    //   product: prodVerNum,
    //   sample: sampVerNum
    // }
  });
}

function formatColumns(sheet, headers, colsToFormat, rowNum) {
  for (const colType in colsToFormat) {
    for (const colNum of colsToFormat[colType]) {
      // Image ID Cols
      if (colType === 'imageId') {
        const idCell = sheet.getRange(rowNum, colNum);
        const id  = idCell.getDisplayValue();

        let url;
        try {
          url = DriveApp.getFileById(id).getUrl();
        } catch(err) {
          console.warn('this image id gave an error when trying to use DriveApp:')
          console.warn(id);
          throw err;
        }
        const hyperlink = SpreadsheetApp.newRichTextValue().setText(id).setLinkUrl(url).build();

        idCell.setRichTextValue(hyperlink);
      }

      // Combined columns with formulae
      else if (colType === 'combined') {
        const header = headers[Number(colNum) - 1];
        const { formula, colsToCombine } = COMBINED_COLS_FORMULA[header];

        const totalCell = sheet.getRange(rowNum, colNum);
        const rangeToCombine = sheet.getRange(rowNum, colNum - colsToCombine, 1, colsToCombine);
        const formulaString = formula(rangeToCombine);
        
        console.log('formula string', formulaString);

        totalCell.setValue(formulaString);
      }
    }
  }
}

/**
 * 
 * 
 * 
 * ALREADY WORKING
 * 
 * 
 * 
 * 
 * 
 */

function getRugDatabaseInfo() {
  // Object to return
  const databaseInfo = { productRows: {}, sampleRows: {}, codes: {} };

  // Hard-coded google sheet ids
  const productSheetId = 0;
  const sampleSheetId = 348173125;

  // Sample rows and headers
  const allRugSheets = SpreadsheetApp.openById('1imNb5MJhYuqyAFAzRTkX3c7CC2mGMH413gIEvOMknnc').getSheets();
  const sampleSheet = allRugSheets.find(sheet => sheet.getSheetId() === sampleSheetId);
  const sampleData = sampleSheet.getDataRange().getDisplayValues();
  const sampleHeaders = sampleData.shift();
  // databaseInfo.versionNumbers.sample = getSheetVersionNumber(sampleSheet.getName());
  
  // Gather sample data
  const [sampleSkuCol, sampleSizeCol] = [sampleHeaders.indexOf('Temple SKU/DM Code'), sampleHeaders.indexOf('Size')];
  for (const row of sampleData) {
    // Use sku and size as keys
    const sku = row[sampleSkuCol];
    const size = row[sampleSizeCol];

    // Initialize an object with the sku and size
    if (Object.hasOwn(databaseInfo.sampleRows, sku)) {
      databaseInfo.sampleRows[sku][size] = { fullRow: null };
    } else {
      databaseInfo.sampleRows[sku] = { [size]: { fullRow: null } };
    }

    // Add row values to rowAsObj and databaseInfo.samplesRows[sku][size]
    const rowAsObj = {};
    row.forEach((val, idx) => {
      const header = sampleHeaders[idx];
      rowAsObj[header] = val;
      databaseInfo.sampleRows[sku][size][header] = val;
    });

    // Add rowAsObj to databaseInfo.samplesRows[sku][size]
    databaseInfo.sampleRows[sku][size].fullRow = rowAsObj;
  }

  // Product rows and headers
  const productSheet = allRugSheets.find(sheet => sheet.getSheetId() === productSheetId);
  const productData = productSheet.getDataRange().getDisplayValues();
  const productHeaders = productData.shift();
  const [productSkuCol, productBatchCol] = [productHeaders.indexOf('Temple SKU/DM Code'), productHeaders.indexOf('Unique Sample Batch Code')];
  // databaseInfo.versionNumbers.product = getSheetVersionNumber(productSheet.getName());
  
  // Gather the product data
  for (const row of productData) {
    // Use sku and batch as keys
    const sku = row[productSkuCol];
    const batch = row[productBatchCol];

    // Add sku and batch to databaseInfo.codes
    if (Object.hasOwn(databaseInfo.codes, sku)) {
      databaseInfo.codes[sku].push(batch);
    } else {
      databaseInfo.codes[sku] = [batch];
    }

    // Initialize an object with the sku and batch
    if (Object.hasOwn(databaseInfo.productRows, sku)) {
      databaseInfo.productRows[sku][batch] = { fullRow: null, samples: [] };
    } else {
      databaseInfo.productRows[sku] = { [batch]: { fullRow: null, samples: [] } };
    }

    // Add row values to rowAsObj and databaseInfo.productRows[sku][batch]
    const rowAsObj = {};
    row.forEach((val, idx) => {
      // Skip headers Temple wants to ignore
      const header = productHeaders[idx];
      if (IGNORE_THESE_HEADERS.has(header)) return;

      // Add header and value to rowAsObj and databaseInfo
      rowAsObj[header] = val;
      databaseInfo.productRows[sku][batch][header] = val;

      // Handle sample columns
      if (header.toLowerCase().includes('inventory') && val) {
        // const sampleSize = `${header.split(' ')[0]} Sample`;
        const sampleSize = header.split(' ').slice(0, -1).join(' ');
        if (Object.hasOwn(databaseInfo.sampleRows, sku)) {
          if (Object.hasOwn(databaseInfo.sampleRows[sku], sampleSize)) {
            const sampleInfo = { ...databaseInfo.sampleRows[sku][sampleSize].fullRow };
            databaseInfo.productRows[sku][batch].samples.push(sampleInfo);
          } else {
            console.warn(`Could not find ${sampleSize} in databaseInfo.sampleRows[${sku}]:\n`)
            console.log(databaseInfo.sampleRows[sku]);
          }
        } else {
          console.warn(`Could not find ${sku} in databaseInfo.sampleRows:\n`)
          console.log(databaseInfo.sampleRows);
        }
      }

      // Handle non-sample columns first
      if (!(header.toLowerCase().includes('inventory'))) {
        rowAsObj[header] = val;
        databaseInfo.productRows[sku][batch][header] = val;
        return;
      }

      // Skip sample columns with no value
      // if (val === '') return;

      // Get sample size and add sample row info to databaseInfo
      
    });

    // Add rowAsObj to databaseInfo.productRows[sku][batch]
    databaseInfo.productRows[sku][batch].fullRow = rowAsObj;
  }

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

function getRugDropdownValues() {
  const ss = SpreadsheetApp.openById('1imNb5MJhYuqyAFAzRTkX3c7CC2mGMH413gIEvOMknnc');
  const dataValidationDirectoryId = 1522990621;
  const dataValidationDirectory = ss.getSheets().find(
    sheet => sheet.getSheetId() === dataValidationDirectoryId
  );
  // const versionNum = getSheetVersionNumber(dataValidationDirectory.getName());

  const dvdData = dataValidationDirectory.getDataRange().getDisplayValues();
  const dvdHeaders = dvdData.shift().map(header => header.toLowerCase());

  const serverVals = {};
  for (const hdr of dvdHeaders) {
    serverVals[hdr] = [];
  }
  for (const row of dvdData) {
    row.forEach((val, i) => {
      if (val) {
        serverVals[dvdHeaders[i]].push(val);
      }
    });
  }

  return JSON.stringify(serverVals);
}

/**
 * Before going to prod to do:
 * 1) Fix the formatting of the spreadsheet
 * 2) Change the spreadsheet id to point to the prod spreadsheet
 * 3) Add a version number trigger to prod
 */