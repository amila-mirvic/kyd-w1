/**
 * World 1 (Democracy) content/config
 * Keep this file purely data-driven: no React, no side-effects.
 * You can iterate on the content later (texts, tasks, scoring hints).
 */

export const WORLD_1 = {
  id: "world-1",
  title: "Democracy",
  description: "Everyday situations where decisions, rights, and power matter.",
  badge: {
    id: "citizen-awareness",
    name: "Citizen Awareness Badge",
  },
  tasks: [
    {
      id: "task-1",
      title: "The Democracy Gate",
      type: "SORT_STATEMENTS",
      scoring: { maxPoints: 30 },
    },
    {
      id: "task-2",
      title: "Who Decides What?",
      type: "MATCH_DECISIONS",
      scoring: { maxPoints: 30 },
    },
    {
      id: "task-3",
      title: "Rights vs Rules",
      type: "CASE_DILEMMAS",
      scoring: { maxPoints: 30 },
    },
    {
      id: "task-4",
      title: "Democracy in Daily Life",
      type: "SCENE_EXPLORER",
      scoring: { maxPoints: 30 },
    },
  ],
};
