let files;
export function configureFiles(value) { files = value; }
export async function resolvePhotos(data) {
  for (const diary of data.diaries) for (const photo of diary.photos) {
    if (photo.path) photo.dataUrl = await files.getUrl(photo.path);
  }
  return data;
}
export async function uploadPhotos(photos) {
  for (const photo of photos) {
    if (photo.path) continue;
    if (photo.uploadID) throw new Error('照片上传结果待确认，请稍后重新打开应用核对。');
    const blob = await (await fetch(photo.dataUrl)).blob();
    const path = `photos/${photo.id}.jpg`;
    await files.put(path, blob, { onPrepared: receipt => { photo.uploadID = receipt.id; } });
    photo.path = path;
    photo.dataUrl = await files.getUrl(path);
  }
}
