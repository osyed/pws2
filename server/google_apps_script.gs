var result = {};

function doPost(e) {
  result = {};
  const id = JSON.parse(e.postData.contents).id;
  if (!id)
    return ContentService.createTextOutput(JSON.stringify(e)).setMimeType(
      ContentService.MimeType.JSON
    );

  const search_result = DriveApp.getFolderById(id);
  result.name = search_result.getName();
  result.list = [];
  getFileList(search_result, result.name);
  getFolderList(search_result, result.name);
  // return result;
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function getFileList(folder, name) {
  const file_result = folder.getFiles();
  while (file_result.hasNext()) {
    const file = file_result.next();
    const detail = {
      id: file.getId(),
      name: file.getName(),
      mime: file.getMimeType(),
      type: "file",
      parent: name,
    };
    result.list.push(detail);
  }
}

function getFolderList(folder, name) {
  const folder_search_result = folder.getFolders();
  while (folder_search_result.hasNext()) {
    const folder = folder_search_result.next();
    const detail = {
      id: folder.getId(),
      name: folder.getName(),
      type: "folder",
      parent: name,
    };
    result.list.push(detail);
    getFileList(folder, name);
    getFolderList(folder, name);

    // in case to know the folders under folders recursively
    // getFileList(folder, name + "/" + folder.getName());
    // getFolderList(folder, name + "/" + folder.getName());
  }
}
