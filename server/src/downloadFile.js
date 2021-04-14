const cliProgress = require("cli-progress");
const fs = require("fs");
const axios = require("axios");

const progBar = new cliProgress.SingleBar({
  format: "Download Progress |" + "{bar}" + "| {percentage}%",
});

function downloadFile(start, downloadFiles) {
  if (start > downloadFiles.length - 1) {
    return;
  }
  const file = downloadFiles[start];
  const type = file.type;
  if (type === "folder") {
    downloadFile(start + 1, downloadFiles);
  } else {
    try {
      download(file);
      downloadFile(start + 1, downloadFiles);
    } catch (error) {
      console.log(`Error in downloading ${file.name}`);
      downloadFile(start + 1, downloadFiles);
    }
  }

  async function download(file) {
    let progress = 0;
    let url, name;
    // application/vnd.google-apps.document
    // application/vnd.google-apps.presentation
    // application/vnd.google-apps.spreadsheet
    // application/json
    if (file.mime.includes("application/vnd.google-apps")) {
      let type = file.mime.split(".")[2];
      let format;
      if (type === "document") {
        format = "docx";
        url = `https://docs.google.com/${type}/d/${file.id}/export?format=${format}`;
      } else if (type === "spreadsheet") {
        type = "spreadsheets";
        format = "xlsx";
        url = `https://docs.google.com/${type}/d/${file.id}/export?format=${format}`;
      } else if (type === "presentation") {
        format = "pptx";
        url = `https://docs.google.com/${type}/d/${file.id}/export/pptx`;
      }
      name = file.name + "." + format;
    } else {
      url = `https://drive.google.com/uc?export=download&id=${file.id}`;
      name = file.name;
    }

    const writer = fs.createWriteStream(`./downloads/${file.parent}/${name}`);

    var option = process.argv.slice(2)[0];

    return axios({
      method: "get",
      url: url,
      responseType: "stream",
    }).then((response) => {
      return new Promise((resolve, reject) => {
        if (!option || option !== "-q") progBar.start(10, 0);
        response.data
          .on("end", () => {
            if (!option || option !== "-q") {
              progBar.stop();
              console.log(`${name} downloaded.`);
            }
            resolve(true);
          })
          .on("error", (err) => {
            progBar.stop();
            console.log(`Error occurred while downloading ${name}`);
            reject(err);
          })
          .on("data", (data) => {
            if (!option || option !== "-q") {
              progress += data.length;
              progBar.update(progress);
            }
          })
          .pipe(writer);
      });
    });
  }
}

module.exports = downloadFile;
