import test from 'node:test';
import assert from 'node:assert/strict';
import { configureFiles, uploadPhotos, resolvePhotos } from '../src/files.js';

test('uploads decoded photo bytes and reloads its relative path', async () => {
  let saved;
  configureFiles({
    async put(path, blob) { saved = { path, type: blob.type, bytes: [...new Uint8Array(await blob.arrayBuffer())] }; },
    async getUrl(path) { return `https://example.invalid/${path}`; },
  });
  const photo = { id: 'p-test', dataUrl: 'data:image/jpeg;base64,AAEC/w==' };
  await uploadPhotos([photo]);
  assert.deepEqual(saved, { path: 'photos/p-test.jpg', type: 'image/jpeg', bytes: [0, 1, 2, 255] });
  assert.equal(photo.path, saved.path);
  const data = { diaries: [{ photos: [{ id: photo.id, path: photo.path }] }] };
  await resolvePhotos(data);
  assert.equal(data.diaries[0].photos[0].dataUrl, 'https://example.invalid/photos/p-test.jpg');
});
