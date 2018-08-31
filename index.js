const marked = require('marked');
const fs = require('fs');
const request = require('request-promise');

const getArguments = () => {
  const args = process.argv;
  const path = args[2];

  fs.lstat(path, (err, stats) => {

    if (err) {
      return console.log(err); //Handle error
    } else {
      let getFile = stats.isFile();
      let getDir = stats.isDirectory();
    }
  });
  readFile(path);
};



const readFile = (path) => {
  let md = '';
  fs.readFile(path, 'utf8', (err, data) => {
    md = data;
    const tokens = marked.lexer(md);
    let linkArrFromText = [];
    let lineNumber = 0;
    tokens.forEach(line => {
      if (line.type !== 'space') {
        let lineText = line.text;
        let parragraphSplit = lineText.split('\n');
        parragraphSplit.forEach(element => {
          let isURL = element.indexOf('https');
          let isIMG = element[0];
          if (isURL !== -1 && isIMG === '[') {
            lineNumber++;
            let findAlt = element.indexOf(']');
            let alt = element.slice(1, findAlt);
            let findURL = element.slice(findAlt + 2, element.length - 1);
            let linkObj = {
              lineNumber: lineNumber,
              file: __filename,
              altUrl: alt,
              linkUrl: findURL,
              status: ''
            }
            linkArrFromText.push(linkObj);
          } else {
            lineNumber++;
          }
        });
      } else {
        lineNumber++;
      }
    });
    console.log(linkArrFromText);
    // requestStatus(linkArrFromText);
  });
};

// const requestStatus = (linkArr) => {
//   let options = {
//     method: 'POST',
//     uri: ''
//   };
//   linkArr.forEach(link => {
//     options.uri = link.linkUrl;
//     request(options)
//       .then(res => {
//         console.log(res.statusCode);
//       })
//   })
// }

getArguments();