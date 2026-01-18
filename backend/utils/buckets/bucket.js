const storageZone = "zzep";

const getFile = async ({ folderName, fileName }) => {
  const url = `https://storage.bunnycdn.com/${storageZone}/${folderName}/${fileName}`;
  const get = await fetch(url, {
    method: "GET",
    headers: new Headers({
      AccessKey: process.env.Bucket,
      "Content-Type": "application/octet-stream",
    }),
  });
  const parsed = await get.json();
  return parsed;
};

const postFile = async ({ buffer, folderName, fileName }) => {
  const url = `https://storage.bunnycdn.com/${storageZone}/${folderName}/${fileName}`;
  await fetch(url, {
    method: "PUT",
    headers: new Headers({
      AccessKey: process.env.Bucket,
      "Content-Type": "application/octet-stream",
      "Content-Length": buffer.length,
    }),
    body: buffer,
  });
  return `https://zzep.b-cdn.net/${folderName}/${fileName}`;
};

const deleteFile = async ({ folderName, fileName }) => {
  const url = `https://storage.bunnycdn.com/${storageZone}/${folderName}/${fileName}`;
  const get = await fetch(url, {
    method: "DELETE",
    headers: new Headers({
      AccessKey: process.env.Bucket,
    }),
  });
  const parsed = await get.json();
  return parsed;
};

const deleteFolder = async ({ folderName }) => {
  const url = `https://storage.bunnycdn.com/${storageZone}/${folderName}`;
  const get = await fetch(url, {
    method: "DELETE",
    headers: new Headers({
      AccessKey: process.env.Bucket,
    }),
  });
  const parsed = await get.json();
  return parsed;
};

const listFolder = async ({ folderName }) => {
  const url = `https://storage.bunnycdn.com/${storageZone}/${folderName}`;
  const get = await fetch(url, {
    headers: new Headers({
      AccessKey: process.env.Bucket,
    }),
  });
  const parsed = await get.json();
  return parsed;
};

module.exports = {
  getFile,
  postFile,
  listFolder,
  deleteFile,
  deleteFolder,
};
