// Coalesce save requests during an in-flight write, but never replay an
// uncertain/failed write automatically. The caller may explicitly retry.
export function createSaveQueue(write) {
  let active = false, queued = false, queuedManual = false;
  return {
    async request(manual = false) {
      if (active) {
        queued = true;
        queuedManual ||= manual;
        return;
      }
      active = true;
      try {
        let currentManual = manual;
        while (true) {
          queued = false;
          queuedManual = false;
          const confirmed = await write(currentManual);
          if (!confirmed || !queued) break;
          currentManual = queuedManual;
        }
      } finally {
        active = queued = queuedManual = false;
      }
    },
  };
}
