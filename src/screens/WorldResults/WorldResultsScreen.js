import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GameLayout from "../../components/Layout/GameLayout";
import styles from "./WorldResultsScreen.module.css";

/**
 * WorldResultsScreen (NEW)
 * - Shows total score (0..120), role title + badge
 * - Not wired into routing yet (safe).
 */
function roleFromScore(total) {
  if (total <= 35) return { key: "Observer", label: "Observer" };
  if (total <= 60) return { key: "CuriousCitizen", label: "Curious Citizen" };
  if (total <= 85) return { key: "InformedParticipant", label: "Informed Participant" };
  if (total <= 105) return { key: "Navigator", label: "Navigator" };
  return { key: "Builder", label: "Builder" };
}

export default function WorldResultsScreen() {
  const navigate = useNavigate();
  const { worldId } = useParams();

  const mockTotal = 0; // TODO: pull from GameProvider state (scoreByWorld[worldId])
  const role = useMemo(() => roleFromScore(mockTotal), [mockTotal]);

  return (
    <GameLayout>
      <div className={styles.wrap}>
        <button className={styles.backBtn} type="button" onClick={() => navigate(`/world/${worldId || "world-1"}`)}>
          ← Back to World
        </button>

        <div className={styles.card}>
          <div className={styles.kicker}>{worldId || "world-1"}</div>
          <h1 className={styles.role}>{role.label}</h1>
          <div className={styles.scoreRow}>
            <span className={styles.scoreLabel}>World score</span>
            <span className={styles.scoreValue}>{mockTotal} / 120</span>
          </div>

          <div className={styles.badge}>
            <div className={styles.badgeCircle} />
            <div className={styles.badgeText}>
              <div className={styles.badgeTitle}>Citizen Awareness Badge</div>
              <div className={styles.badgeDesc}>Unlocked when you complete World 1.</div>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.secondaryBtn} type="button" onClick={() => navigate("/world-select")}>
              Back to Worlds
            </button>
            <button className={styles.primaryBtn} type="button" onClick={() => navigate(`/world/${worldId || "world-1"}`)}>
              Replay / Review
            </button>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
