export async function previewImage(url) {
  if (!url) return "";
  try {
    const response = await fetch(url, {
      credentials: "omit",
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return "";
    const type = response.headers.get("content-type") || "";
    if (type.startsWith("image/")) return response.url;
    if (!type.includes("text/html")) return "";
    const doc = new DOMParser().parseFromString(
      await response.text(),
      "text/html",
    );
    const image = doc
      .querySelector(
        'meta[property="og:image"], meta[name="twitter:image"], meta[property="twitter:image"]',
      )
      ?.getAttribute("content");
    return image ? new URL(image, response.url).href : "";
  } catch {
    return "";
  }
}
