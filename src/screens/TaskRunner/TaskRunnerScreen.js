import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameLayout from "../../components/Layout/GameLayout";
import styles from "./TaskRunnerScreen.module.css";

/**
 * TaskRunnerScreen (NEW)
 * - Loads world config + task config by params
 * - Renders a task component based on task.type
 * - On complete -> dispatch COMPLETE_TASK (later) + navigate back / results
 * - Not wired into App routes yet (safe).
 */
export default function TaskRunnerScreen() {
  const navigate = useNavigate();
  const { worldId, taskId } = useParams();

  const task = useMemo(() => {
    // TODO: resolve from world config
    return {
      id: taskId || "task-1",
      type: "PLACEHOLDER",
      title: "Task",
      intro: "Task intro goes here.",
    };
  }, [taskId]);

  return (
    <GameLayout>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <button className={styles.backBtn} type="button" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className={styles.meta}>
            <div className={styles.worldId}>{worldId || "world-1"}</div>
            <div className={styles.taskTitle}>{task.title}</div>
          </div>
        </div>

        <div className={styles.body}>
          <p className={styles.intro}>{task.intro}</p>

          <div className={styles.placeholder}>
            <div className={styles.placeholderTitle}>Task UI placeholder</div>
            <div className={styles.placeholderText}>
              Implement task component based on <code>task.type</code> and world config.
            </div>
          </div>

          <div className={styles.footer}>
            <button className={styles.primaryBtn} type="button" onClick={() => navigate(`/world/${worldId || "world-1"}`)}>
              Save & Exit
            </button>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
