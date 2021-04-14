const fs = require("fs");
const downloadFile = require("./downloadFile");

function createDownloadDirectory(filesToDownload) {
  // const dir = "./downloads/" + filesToDownload.name;
  // if (!fs.existsSync(dir)) {
  //   fs.mkdirSync(dir);
  // }
  const status = createDirFirst(filesToDownload.list);
  if (status) {
    downloadFile(0, filesToDownload.list);
  } else {
    console.log("Error in creating download directory!");
  }
}

function createDirFirst(filesToDownload) {
  for (var i = 0; i < filesToDownload.length; i++) {
    const file = filesToDownload[i];
    if (file.parent !== "pws") {
      if (file.type === "folder") {
        const dir = "./downloads/" + file.parent + "/" + file.name;
        mkdir(dir);
      } else {
        const dir = "./downloads/" + file.parent;
        mkdir(dir);
      }
      if (i === filesToDownload.length - 1) {
        return true;
      }
    }
  }
  return false;
}
function mkdir(path, root) {
  var dirs = path.split("/"),
    dir = dirs.shift(),
    root = (root || "") + dir + "/";

  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(root);
    }
  } catch (e) {
    //dir wasn't made, something went wrong
    if (!fs.statSync(root).isDirectory()) throw new Error(e);
  }

  return !dirs.length || mkdir(dirs.join("/"), root);
}

module.exports = { createDownloadDirectory, mkdir };
