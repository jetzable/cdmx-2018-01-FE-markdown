const marked = require('marked');
const fs = require('fs');
const https = require('https');

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
            let finUrlEnd = element.indexOf(')');
            let alt = element.slice(1, findAlt);
            let findURL = element.slice(findAlt + 2, finUrlEnd);
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
    requestStatus(linkArrFromText);
  });
};

const requestStatus = (linkArr) => {
  linkArr.forEach(link => {
    https.get(link.linkUrl, resp => {
      link.status = resp.statusCode + ' ' + resp.statusMessage;
      console.log(link);
    });
  });
};


getArguments();

