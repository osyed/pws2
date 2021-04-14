const axios = require("axios");
const fs = require("fs");
const { createDownloadDirectory } = require("./src/createDownloadDirectory");

// This script_url is the web app deployed on google apps script.
// The code used is in google_apps_script.gs file.
const script_url = "";

const file_list = async (id, line_no) => {
  try {
    const response = await axios.post(script_url, {
      id: id,
    });
    if (response.status === 200) {
      const download_list = response.data;
      if (download_list.name) {
        // download_list.list.map((each) => {
        //   console.log(each.name, each.type, each.parent);
        // });
        if (download_list.list[0].parent === "pws") {
          createDownloadDirectory(download_list);
        } else {
          console.log(
            "Line no. " +
              line_no +
              " should be the 'pws' folder link in 'urls.txt' file!"
          );
        }
      } else {
        console.log(
          "No file found in " + line_no + " link of 'urls.txt' file!"
        );
      }
    }
  } catch (error) {
    console.log("Error in getting the file list");
  }
};

try {
  const urls = fs
    .readFileSync("./urls.txt", "utf8")
    .split("\n")
    .filter(Boolean);
  if (urls.length > 0) {
    urls.forEach((url, i) => {
      const line_no = i + 1;
      if (url.includes("https://drive.google.com/drive/folders/")) {
        const link = url.split("folders/")[1];
        if (!link) {
          console.log(
            "Line no. " + line_no + " has wrong drive link in 'urls.txt' file!"
          );
        }
        const id = link.split("?")[0];
        file_list(id, line_no);
      } else {
        console.log(
          "Line no. " + line_no + " has wrong drive link in 'urls.txt' file!"
        );
      }
    });
  } else {
    console.log("No link found in 'urls.txt' file!");
  }
} catch (e) {
  console.log("File 'urls.txt' is not found!");
}
