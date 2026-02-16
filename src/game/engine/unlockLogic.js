/**
 * Unlock rules (NEW)
 * Keep these rules here so the reducer stays clean.
 */

export function unlockNextTask({ worldId, completedTaskId, worldConfig }) {
  if (!worldConfig || worldConfig.id !== worldId) return null;

  const idx = worldConfig.tasks.findIndex((t) => t.id === completedTaskId);
  if (idx < 0) return null;

  const next = worldConfig.tasks[idx + 1];
  return next ? next.id : null;
}
