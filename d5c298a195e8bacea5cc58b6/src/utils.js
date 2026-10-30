export function pad(n) { return n < 10 ? `0${n}` : `${n}`; }
export function dateKey(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
export function monthLabel(d) { return `${d.getFullYear()}年${pad(d.getMonth() + 1)}月`; }
export function newId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
export function photoId() { return `p-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

// Stickers show at 96×96: store a re-encoded copy no larger than 600px on its longest side.
export function readPhoto(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => resolve(String(reader.result));
      image.onload = () => {
        const scale = Math.min(1, 600 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

// Diary text is editor HTML: keep only the line/span structure the editor produces.
export function cleanHtml(html) {
  const box = document.createElement('div');
  box.innerHTML = html || '';
  const walk = node => {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === Node.TEXT_NODE) continue;
      if (child.nodeType !== Node.ELEMENT_NODE) { child.remove(); continue; }
      const tag = child.tagName.toLowerCase();
      if (!['span', 'br', 'div'].includes(tag)) {
        if (['script', 'style', 'iframe', 'object', 'embed'].includes(tag)) child.remove();
        else { child.replaceWith(...child.childNodes); walk(node); return; }
        continue;
      }
      for (const attr of [...child.attributes]) if (attr.name !== 'class') child.removeAttribute(attr.name);
      walk(child);
    }
  };
  walk(box);
  return box.innerHTML;
}
