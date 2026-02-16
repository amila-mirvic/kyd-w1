export function gameReducer(state, action) {
  switch (action.type) {
    case "NAVIGATE": {
      const next = action.payload;
      if (next === state.screen) return state;

      return {
        ...state,
        screenHistory: [...state.screenHistory, state.screen],
        screen: next,
      };
    }

    case "BACK": {
      if (!state.screenHistory.length) return state;

      const prev = state.screenHistory[state.screenHistory.length - 1];
      return {
        ...state,
        screenHistory: state.screenHistory.slice(0, -1),
        screen: prev,
      };
    }

    case "SET_PLAYER_NAME":
      return {
        ...state,
        player: { ...state.player, name: action.payload },
      };

    case "SET_CHARACTER":
      return {
        ...state,
        player: { ...state.player, characterId: action.payload },
      };

    case "SELECT_WORLD":
      return {
        ...state,
        progress: { ...state.progress, selectedWorldId: action.payload },
      };

    default:
      return state;
  }
}
