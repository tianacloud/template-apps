const prefix = 'photos/';
export const validPhotoPath = path => typeof path === 'string' && /^photos\/[a-zA-Z0-9-]+\.jpg$/.test(path);
const legacy = image => typeof image === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image) && image.length < 1500000;
export const validPhoto = value => validPhotoPath(value?.path) || legacy(value?.image);
export async function photoBlob(photo, files) {
  if (legacy(photo?.image)) return (await fetch(photo.image)).blob();
  if (!validPhotoPath(photo.path) || !files?.get) throw new Error('照片文件不可用');
  const response = await files.get(photo.path);
  if (!response.ok) throw new Error('照片读取失败，请检查网络后重试');
  return response.blob();
}
const journalKey = () => 'opengym-photo-upload:' + (globalThis.window?.tiana?.appId || 'unknown');
const digest = async bytes => [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
async function verifyPending(files, pending) {
  if (pending.uploadId) { const status = await files.uploadStatus(pending.uploadId); if (!status.completed) await files.completeUpload(pending.uploadId); }
  const response = await files.get(pending.path); if (!response.ok) throw new Error('读取失败');
  const bytes = await response.arrayBuffer(); if (bytes.byteLength !== pending.size || await digest(bytes) !== pending.sha256) throw new Error('文件不一致');
}
export async function savePhoto(blob, files) {
  if (!files?.put || !files?.get) throw new Error('文件服务不可用，请重新打开应用');
  const journal = globalThis.localStorage; const old = JSON.parse(journal.getItem(journalKey()) || 'null');
  if (old) { try { await verifyPending(files,old); journal.removeItem(journalKey()); } catch { throw new Error('上次照片上传结果尚未确认，请稍后重试'); } }
  const bytes = await blob.arrayBuffer(); const pending = {path:prefix + crypto.randomUUID() + '.jpg',size:bytes.byteLength,sha256:await digest(bytes),requestId:crypto.randomUUID()};
  const save = () => journal.setItem(journalKey(),JSON.stringify(pending)); save();
  try { await files.put(pending.path,blob,{requestId:pending.requestId,onPrepared:receipt=>{pending.uploadId=receipt.id;save();}}); await verifyPending(files,{...pending,uploadId:null}); journal.removeItem(journalKey()); return pending.path; }
  catch (error) { if(error.uploadId){pending.uploadId=error.uploadId;save();} try { await verifyPending(files,pending); journal.removeItem(journalKey()); return pending.path; } catch { throw new Error('照片上传结果尚未确认，请稍后重试'); } }
}
export async function dataUrl(blob) {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('照片读取失败')); reader.readAsDataURL(blob); });
}
export async function exportWithPhotos(store, files) {
  const result = store.export();
  for (const record of result.records) if (record.kind === 'photo') {
    record.payload = {...record.payload, image: await dataUrl(await photoBlob(record.payload, files))};
    delete record.payload.path;
  }
  return result;
}
export async function importPhoto(payload, files) {
  // Backups carry image bytes, not an app-specific file path.
  if (!legacy(payload.image)) throw new Error('照片备份不包含有效图片');
  const path = await savePhoto(await photoBlob(payload, files), files);
  const result = {...payload, path}; delete result.image; return result;
}
