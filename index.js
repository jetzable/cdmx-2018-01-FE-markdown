const marked = require('marked');
const fs = require('fs');
const request = require('request');

const getArguments = () => {
  const args = process.argv;
  const path = args[2];

  fs.lstat(path, (err, stats) => {

    if (err) {
      return console.log(err); //Handle error
    } else {
      const getFile = stats.isFile();
      const getDir = stats.isDirectory();
      if (getFile) {
        readFile(path);
        return path;
      } else {
        fs.readdir(path, 'utf8', (err, info) => {
          if (err) {
            console.log(err);
          } else {
            info.forEach(file => {
              let isMarkdown = file.indexOf('.md');
              if (isMarkdown !== -1) {
                let fileFound = path + file;
                readFile(fileFound);
              }
            });
          }
        });
      }
    }
  });
};

const readFile = (path) => {
  fs.readFile(path, 'utf8', (err, data) => {
    const tokens = marked.lexer(data);
    const listOfUrl = [];
    let lineNumber = 0;
    tokens.forEach(line => {
      const isListType = line.type.indexOf('list');
      if (line.type !== 'space' && isListType === -1) {
        const lineText = line.text;
        const parragraphSplit = lineText.split('\n');
        parragraphSplit.forEach(element => {
          const isThereAnUrl = element.indexOf('http');
          const findUrlStart = element.indexOf('[');
          const isItAnImg = findUrlStart - 1;
          if (isThereAnUrl !== -1 && isItAnImg !== '!') {
            lineNumber++;
            const findTextEnd = element.indexOf(']');
            const findUrlEnd = element.indexOf(')');
            const altUrl = element.slice(findUrlStart + 1, findTextEnd);
            const linkUrl = element.slice(findTextEnd + 2, findUrlEnd);
            let urlInfo = {
              lineNumber: lineNumber,
              file: path,
              text: altUrl,
              href: linkUrl,
              status: ''
            }
            listOfUrl.push(urlInfo);
          } else {
            lineNumber++;
          }
        });
      } else {
        lineNumber++;
      }
    });
    requestStatus(listOfUrl);
  });
};


getArguments();