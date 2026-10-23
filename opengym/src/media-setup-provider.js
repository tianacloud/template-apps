import {MediaPreparation, ORIGINAL_COMMIT} from './media-preparation.js';
import manifestText from '../media/original-index.txt';
import originalNotice from '../NOTICE.md';
import mediaNotice from '../media/media-notice.md';

const index = JSON.parse(manifestText);
if (index.exerciseCount !== 5632 || index.sourceCommit !== ORIGINAL_COMMIT) throw new Error('完整素材目录无效');

export function createMediaPreparation(media) {
  return new MediaPreparation(media.files, {appId: window.tiana?.appId, index, manifestText,
    notices: {original: originalNotice, media: mediaNotice}, onReady: () => media.refresh(),
    async fetchAsset(entry, kind) {
      const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch(`https://raw.githubusercontent.com/DuarteSantos8/openGym/${ORIGINAL_COMMIT}/catalogue/media/${kind}/${entry.name}`,
          {credentials: 'omit', cache: 'force-cache', referrerPolicy: 'no-referrer', signal: controller.signal});
        if (!response.ok) throw new Error('素材来源暂时无法读取');
        return await response.arrayBuffer();
      } finally { clearTimeout(timeout); }
    }});
}
