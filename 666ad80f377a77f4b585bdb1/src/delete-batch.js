export async function deletePhotoBatch(photos, remove, onResult) {
  let next = 0,
    completed = 0,
    succeeded = 0,
    lastError = "";
  const failures = [];
  async function worker() {
    while (next < photos.length) {
      const photo = photos[next++];
      let error;
      try {
        await remove(photo);
        succeeded++;
      } catch (cause) {
        error = cause;
        failures.push(photo);
        lastError = cause?.message || "删除失败";
      }
      completed++;
      onResult(photo, error, {
        total: photos.length,
        completed,
        succeeded,
        failed: failures.length,
        error: lastError,
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
  await Promise.all(Array.from({ length: Math.min(3, photos.length) }, worker));
  return failures;
}
