// I want to be able to store the information from the quotes I have tested so far so that when I make changes to the quote extracting function I can rerun all the old examples and see if they're still giving the right answers

function unitTestExtractQuoteInfo() {
  // const scriptProps = PropertiesService.getScriptProperties();
  // const quoteHashes = scriptProps.getProperty('quote-hashes');

  const correctAnswers = {
    "a+oZjfoK/XUsGY2OhXgt8iK3EpY2SOYBw5vddtvvNp4=": {
      "client-name": "Tilton Fenwick",
      "sidemark": "Gish/Greg's Office",
      "quote-number": "106F6",
      "requested-deposit": "$5,591.00"
    },
    "1iV4MqAFPNOO3BzJ/wOIssUC6puq1cpmCIWsd0y76zM=": {
      "client-name": "MDV Design",
      "requested-deposit": "$4,008.00",
      "sidemark": "Wallpapers",
      "quote-number": "105YQ"
    },
    "3CeM2Sd7rJiH2oK1qZ3xZ0wxdbiGxs2ob71jWXaPwa4=": {
      "client-name": "Ferrer",
      "sidemark": "Helene Blanche",
      "quote-number": "106FS",
      "requested-deposit": "$6,482.00"
    },
    "5w3uQvycvhyWCFC2d31QLA5WwS4LXFhYJcfbB3uSbBQ=": {
      "requested-deposit": "$9,095.50",
      "sidemark": "Gish/Bedroom 2",
      "quote-number": "106F8",
      "client-name": "Tilton Fenwick"
    },  // Corrected
    "wZlMCsK4JTam9ZMdmealHBI+cj5vtacx6BBOw+hcwFU=": {
      "requested-deposit": "$3,725.00",
      "client-name": "Gramercy Design",
      "sidemark": "GRAM/ 49 King",
      "quote-number": "106GV"
    },
    "14BaaI8m2F9KozsBGQqOS1wA84EmBD/oegg7N/tNIvs=": {
      "requested-deposit": "$27,182.00",
      "quote-number": "106H2",
      "sidemark": "EB/ Stair Runners",
      "client-name": "Emma Beryl Interiors"
    },
    "i9a/vjeknmFvs0YXxKf/ZAyFi6GfFURZ3mU3MLvZZd0=": {
      "sidemark": "Hamptons/Garden Path",
      "client-name": "Emma Beryl Interiors",
      "quote-number": "106EP",
      "requested-deposit": "$4,748.00"
    },
    "1HwkWAxPjngHFcaQA86eFJa8EAQozAUd7ulHUkRq+44=": {
      "quote-number": "10656",
      "client-name": "House & Home / Ann Von Kreuter",
      "sidemark": "123 N Anita Nursery",
      "requested-deposit": "$1,265.00"
    },
    "e9SLx94KtCtIYWxcD4ZmShKH3rcypN4WTspxC5TwGMY=": {
      "quote-number": "106GE",
      "sidemark": "ELM/ McLanahan",
      "requested-deposit": "$4,499.00",
      "client-name": "Elmwooddesign"
    },
    "L59gThEe7EVplQB1rkjySfJus8Q/Y7lwVCSSF2PKaDU=": {
      "quote-number": "106F4",
      "requested-deposit": "$10,577.08",
      "client-name": "Tilton Fenwick",
      "sidemark": "Gish/Primary Bedroom"
    },
    "Mu0iDcVcrmaaADGs3GH+50C3q7etmeNIITOAKUazC+Y=": {
      "requested-deposit": "$4,761.00",
      "client-name": "Tilton Fenwick",
      "sidemark": "Gish/ADU",
      "quote-number": "106FA"
    },
    "JDgWuGJ6KzjC2dJ2TCYQXzBEaEQazXrJJPaza7ZTocw=": {
      "requested-deposit": "$8,383.80",
      "sidemark": "Gish/Sitting Room",
      "client-name": "Tilton Fenwick",
      "quote-number": "106F5"
    },
    "6lvVUSnIleLYrETcMIEXp9S1ZhPot317jUfm1pUbiHU=": {
      "sidemark": "Fabrics",
      "client-name": "Design Motto Studio",
      "quote-number": "106GB",
      "requested-deposit": "$3,988.00"
    },
    "b+2Qpd3r9cUuvWQ0lKW7qI1KiZ8x84SyarNwgXy/lh4=": {
      "client-name": "Gramercy Design",
      "quote-number": "106H3",
      "requested-deposit": "$3,533.00",
      "sidemark": "GRAM/ 49 King / W2W"
    },
    "XaqW+jiTaxfdW+TQlFOtyRK9I/YXYUWo6PHzmWcFytA=": {
      "quote-number": "106F9",
      "requested-deposit": "$6,037.00",
      "sidemark": "Gish/Bedroom 3",
      "client-name": "Tilton Fenwick"
    },
    "iFz7hXbfEUAKHVGbohwygYL4zIpZiywxDCrm+scCNVo=": {
      "sidemark": "Family Room",
      "client-name": "Arditi Design",
      "requested-deposit": "$1,629.00",
      "quote-number": "106EX"
    },
    "KVSaLNTKJBVpPeQknkHNXR8vZT4WXM9AWPv9BlT5zMU=": {
      "sidemark": "Emanuelson TCL Office",
      "client-name": "Shelby Wagner Design",
      "requested-deposit": "$3,590.00",
      "quote-number": "106ED"
    },
    "AhzQpkuZN6MIs4ivAcAL7HHbHTFVRalGdLzh6O98v6w=": {
      "sidemark": "Crosby Designs/ COBURN",
      "client-name": "Crosby Designs",
      "requested-deposit": "$2,945.00",
      "quote-number": "1068N"
    },
    "GMrw7cUcyd/y08CpjvcFJ1njajsLHWT11JQE+5bIg1I=": {
      "sidemark": "Ottoline Fabric",
      "client-name": "323 Designs",
      "requested-deposit": "$0.00",
      "quote-number": "106PW"
    },
  };

  const testFolder = DriveApp.getFolderById('1JfrcNnN0BhGAORbVp3L1C_Rnachqw_Fe');
  const files = testFolder.getFiles();

  const allMistakes = {};
  while (files.hasNext()) {
    const file = files.next();
    const doc = DocumentApp.openById(file.getId())
    const text = doc.getBody().getText();
    const byteArr = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text);
    const hash = Utilities.base64Encode(byteArr);

    if (!Object.hasOwn(correctAnswers, hash)) {
      Logger.log(`Hash not found for file: ${file.getName()}`);
      continue;
    }

    const quoteInfo = extractQuoteInfo(text);
    const correctInfo = correctAnswers[hash];

    const mistakes = {}
    for (const key in correctInfo) {
      if (quoteInfo[key] !== correctInfo[key]) {
        const mistakeString = `Expected: ${correctInfo[key]}\nActual: ${quoteInfo[key]}`;
        mistakes[key] = mistakeString;
      }
    }

    if (Object.keys(mistakes).length) {
      allMistakes[file.getName()] = mistakes;
    }
  }

  const mistakeFileNames = Object.keys(allMistakes);
  if (mistakeFileNames.length) {
    Logger.log(`Mistakes found (${mistakeFileNames.length}):`);
    mistakeFileNames.forEach(fileName => {
      Logger.log(`File: ${fileName}`);
      const mistakes = allMistakes[fileName];
      for (const key in mistakes) {
        Logger.log(`${key}:`);
        Logger.log(mistakes[key]);
      }
    });
    Logger.log("----")
  } else {
    Logger.log("All tests passed!");
  }
}

function computeHashKey() {
  const props = PropertiesService.getScriptProperties()
  const textKeys = props.getKeys().filter(key => key.startsWith('quote106'));
  textKeys.forEach(key => {
    const text = props.getProperty(key);
    const byteArr = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text);
    const hash = Utilities.base64Encode(byteArr);
    console.log(key);
    console.log(hash);
  })
}
