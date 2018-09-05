const marked = require('marked');
const fs = require('fs');
const request = require('request');
const path = require('path');

const requestLinkStatus = (urlInfo) => {
  request(urlInfo.href, (error, resp) => {
    if (error) {
      console.log(error);
    }
    const urlStatus = resp.statusCode + ' ' + resp.statusMessage;
    urlInfo.status = urlStatus;
    console.log(urlInfo);
  });
};

const readFile = (file, linkStatus) => {
  fs.readFile(file, 'utf8', (err, data) => {
    const tokens = marked.lexer(data);
    let lineNumber = 0;
    tokens.forEach(line => {
      const isListType = line.type.indexOf('list');
      if (line.type !== 'space' && isListType === -1) {
        const lineText = line.text;
        const parragraphSplit = lineText.split('\n');
        parragraphSplit.forEach(element => {
          const isThisAnUrl = element.indexOf('http');
          const urlStart = element.indexOf('[');
          const isItAnImg = urlStart - 1;
          if (isThisAnUrl !== -1 && isItAnImg !== '!') {
            lineNumber++;
            const textEnd = element.indexOf(']');
            const urlEnd = element.indexOf(')');
            const altUrl = element.slice(urlStart + 1, textEnd);
            const linkUrl = element.slice(textEnd + 2, urlEnd);
            const urlInfo = {
              lineNumber: lineNumber,
              file: file,
              text: altUrl,
              href: linkUrl,
              status: ''
            }
            linkStatus(urlInfo);
          } else {
            lineNumber++;
          }
        });
      } else {
        lineNumber++;
      }
    });
  });
};


const getArguments = () => {
  const args = process.argv;
  return args;
};

const readPath = (arguments, readFile) => {
  const eachArgument = arguments();
  const filePath = eachArgument[2];
  const resolvedpath = path.resolve(filePath);
  fs.lstat(resolvedpath, (err, pathinfo) => {
    if (err) {
      return console.log(err); //Handle error
    } else {
      const isThisAFile = pathinfo.isFile();
      const isThisADir = pathinfo.isDirectory();
      if (isThisAFile) {
        readFile(resolvedpath, requestLinkStatus);
      } else {
        fs.readdir(resolvedpath, 'utf8', (err, dirInfo) => {
          if (err) {
            console.log(err);
          } else {
            dirInfo.forEach(file => {
              const isThisAMarkdownFile = file.indexOf('.md');
              if (isThisAMarkdownFile !== -1) {
                const markdownFile = resolvedpath + file;
                readFile(markdownFile, requestLinkStatus);
              }
            });
          }
        });
      }
    }
  });
};

readPath(getArguments, readFile);