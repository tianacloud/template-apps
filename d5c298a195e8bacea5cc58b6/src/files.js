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
    const match = /^data:([^;,]+);base64,(.*)$/s.exec(photo.dataUrl);
    if (!match) throw new Error('照片格式无法读取，请重新选择。');
    const binary = atob(match[2]);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const blob = new Blob([bytes], { type: match[1] });
    const path = `photos/${photo.id}.jpg`;
    await files.put(path, blob, { onPrepared: receipt => { photo.uploadID = receipt.id; } });
    photo.path = path;
    photo.dataUrl = await files.getUrl(path);
  }
}
