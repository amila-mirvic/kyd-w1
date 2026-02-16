import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import GameLayout from "../../components/Layout/GameLayout";
import styles from "./WorldHubScreen.module.css";

/**
 * WorldHubScreen (NEW)
 * - Shows world overview (title/desc) + task list/progress.
 * - Keep it data-driven: read world config from src/game/content/*
 * - This file is NOT wired into routing yet, so it won't affect existing app.
 */
export default function WorldHubScreen() {
  const navigate = useNavigate();
  const { worldId } = useParams();

  const world = useMemo(() => {
    // TODO: import and resolve by worldId (world-1 -> world1 config)
    return { id: worldId || "world-1", title: "World Hub", description: "World overview", tasks: [] };
  }, [worldId]);

  return (
    <GameLayout>
      <div className={styles.wrap}>
        <h1 className={styles.title}>{world.title}</h1>
        <p className={styles.desc}>{world.description}</p>

        <div className={styles.tasks}>
          {/* TODO: render task cards (locked/unlocked/completed) */}
          <button
            className={styles.primaryBtn}
            onClick={() => navigate(`/world/${world.id}/task/task-1`)}
            type="button"
          >
            Start / Continue
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
