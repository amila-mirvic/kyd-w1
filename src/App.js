import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { GameProvider } from "./app/GameProvider";

import WelcomeScreen from "./screens/Welcome/WelcomeScreen";
import SetupScreen from "./screens/Setup/SetupScreen";
import WorldSelectorScreen from "./screens/WorldSelector/WorldSelectorScreen";
import World1TaskSelectorScreen from "./screens/World1TaskSelector/World1TaskSelectorScreen";
import World1Task1IntroScreen from "./screens/World1Task1Intro/World1Task1IntroScreen";
import TaskRunnerScreen from "./screens/TaskRunner/TaskRunnerScreen";
import World1Task1Screen from "./screens/World1Task1/World1Task1Screen";
import World1Task2Screen from "./screens/World1Task2/World1Task2Screen";
import World1Task3Screen from "./screens/World1Task3/World1Task3Screen";



export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/setup" element={<SetupScreen />} />
          <Route path="/world-select" element={<WorldSelectorScreen />} />
          <Route path="/world-1" element={<World1TaskSelectorScreen />} />
          <Route path="/world-1/task-1-intro" element={<World1Task1IntroScreen />} />

          <Route path="/world-1/task/:taskId" element={<TaskRunnerScreen />} />
          <Route path="/world-1/task-1" element={<World1Task1Screen />} />
          <Route path="/world-1/task-2" element={<World1Task2Screen />} />
          <Route path="/world-1/task-3" element={<World1Task3Screen />} />


          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
}
