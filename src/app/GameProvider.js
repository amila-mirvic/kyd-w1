import React, { createContext, useContext, useReducer } from "react";
import { initialState } from "./initialState";
import { gameReducer } from "./gameReducer";

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const actions = {
    navigate: (screenKey) => dispatch({ type: "NAVIGATE", payload: screenKey }),
    back: () => dispatch({ type: "BACK" }),
    setName: (name) => dispatch({ type: "SET_PLAYER_NAME", payload: name }),
    setCharacter: (id) => dispatch({ type: "SET_CHARACTER", payload: id }),
    selectWorld: (id) => dispatch({ type: "SELECT_WORLD", payload: id }),
  };

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
