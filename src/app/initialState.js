import { SCREENS } from "../game/constants/screenKeys";

export const initialState = {
  screen: SCREENS.WELCOME,
  screenHistory: [],

  player: {
    name: "",
    characterId: null,
  },

  progress: {
    selectedWorldId: null,
    unlockedWorlds: ["world-1"],
    unlockedTasksByWorld: {
      "world-1": ["task-1"],
    },
    scoreByWorld: {
      "world-1": 0,
    },
  },

  ui: {
    lastPopup: null,
  },
};
