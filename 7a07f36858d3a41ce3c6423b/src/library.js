export async function deleteGame(storage, files, game) {
  try {
    await files.delete(game.file_path);
  } catch (error) {
    if (error.code !== "FILE_NOT_FOUND") throw error;
  }
  // Keep the file path available for retries until file and save cleanup succeed.
  await storage.removeSaves(game.rom_hash);
  await storage.removeGame(game.rom_hash);
}
