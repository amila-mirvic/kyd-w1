import React, { useMemo, useEffect, useState, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./World1TaskSelectorScreen.module.css";

export default function World1TaskSelectorScreen() {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ get player from router state OR localStorage fallback
  const player = useMemo(() => {
    const fromState = location.state && location.state.name ? location.state : null;
    if (fromState) return fromState;

    try {
      const raw = localStorage.getItem("yd_player");
      return raw ? JSON.parse(raw) : { name: "Player", character: "female" };
    } catch {
      return { name: "Player", character: "female" };
    }
  }, [location.state]);

  // ✅ background
  const bgUrl = `${process.env.PUBLIC_URL}/worlds/world1.png`;
  const bgStyle = useMemo(() => ({ "--bg": `url(${bgUrl})` }), [bgUrl]);

  // ✅ character
  const femaleSrc = `${process.env.PUBLIC_URL}/characters/female.png`;
  const maleSrc = `${process.env.PUBLIC_URL}/characters/male.png`;
  const characterSrc = player.character === "male" ? maleSrc : femaleSrc;

  // ✅ task images in public/world1
  const task1Img = `${process.env.PUBLIC_URL}/world1/task1.png`;
  const task2Img = `${process.env.PUBLIC_URL}/world1/task2.png`;
  const task3Img = `${process.env.PUBLIC_URL}/world1/task3.png`;
  const task4Img = `${process.env.PUBLIC_URL}/world1/task4.png`;

  // ✅ achievements icon (FIGMA): public/ui/medal.svg
  const achievementIcon = `${process.env.PUBLIC_URL}/ui/medal.svg`;

  /* ------------------------------------ */
  /* ✅ SAFE STORAGE HELPERS */
  const safeParse = (key) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const safeHas = (key) => {
    try {
      const raw = localStorage.getItem(key);
      return raw !== null && raw !== undefined && raw !== "";
    } catch {
      return false;
    }
  };

  /* ------------------------------------ */
  /* ✅ UNLOCK LOGIC (ROBUST) */
  const [progressTick, setProgressTick] = useState(0);

  useEffect(() => {
    const bump = () => setProgressTick((v) => v + 1);

    const onFocus = () => bump();

    const onStorage = (e) => {
      if (!e?.key) return;
      if (
        e.key.includes("yd_world1_task") ||
        e.key.includes("yd_scores") ||
        e.key.includes("yd_progress") ||
        e.key.includes("yd_task_results")
      ) {
        bump();
      }
    };

    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  /**
   * Detect if a task is completed across all historical versions:
   * - direct keys: yd_world1_taskN, yd_world1_taskN_done, yd_world1_taskN_counted, etc.
   * - yd_progress structure
   * - yd_task_results array
   */
  const isWorld1TaskDone = useCallback(
    (taskNumber) => {
      const n = String(taskNumber);

      // 1) Direct keys (most common in your tasks)
      const directKeys = [
        `yd_world1_task${n}`,
        `yd_world1_task${n}_done`,
        `yd_world1_task${n}_counted`,
        `yd_world1_task_${n}`,
        `yd_task${n}_world1`,
        `yd_task_${n}_world1`,
      ];

      for (const k of directKeys) {
        if (safeHas(k)) return true;
      }

      // 2) If stored as object, check "finished" flags
      const obj = safeParse(`yd_world1_task${n}`);
      if (obj && typeof obj === "object") {
        if (obj.finished === true || obj.completed === true) return true;
        // if it has points and timestamp, consider done
        if (
          (typeof obj.points === "number" || typeof obj.curiosityPoints === "number") &&
          (obj.finishedAt || obj.completedAt || obj.endedAt || obj.timestamp)
        ) {
          return true;
        }
      }

      // 3) yd_progress (some versions store worlds/tasks here)
      const progress = safeParse("yd_progress");
      if (progress?.worlds) {
        const w1 = progress.worlds.world1 || progress.worlds["1"] || progress.worlds.World1;
        const tasks = w1?.tasks || w1?.taskResults || w1?.results;
        if (tasks) {
          const t = tasks[`task${n}`] || tasks[n] || tasks[`Task${n}`];
          if (t) {
            if (t.finished === true || t.completed === true) return true;
            if (typeof t.points === "number" || typeof t.curiosityPoints === "number") return true;
          }
        }
      }

      // 4) yd_task_results array
      const results = safeParse("yd_task_results");
      if (Array.isArray(results)) {
        const found = results.find((r) => {
          const worldMatch =
            r?.world === 1 || r?.world === "1" || r?.worldId === 1 || r?.worldId === "1";
          const taskMatch =
            r?.task === taskNumber ||
            r?.task === n ||
            r?.taskId === taskNumber ||
            r?.taskId === n ||
            r?.taskNumber === taskNumber ||
            r?.taskNumber === n;
          return worldMatch && taskMatch;
        });
        if (found) return true;
      }

      // 5) LAST RESORT: if you already have scores and taskNumber==1,
      // allow Task2 access (prevents accidental lock after legacy save)
      if (taskNumber === 1) {
        const scores = safeParse("yd_scores");
        if (scores && (scores.totalPoints > 0 || scores.totalCuriosityPoints > 0)) {
          return true;
        }
      }

      return false;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progressTick]
  );

  const hasTask1 = useMemo(() => isWorld1TaskDone(1), [isWorld1TaskDone]);
  const hasTask2 = useMemo(() => isWorld1TaskDone(2), [isWorld1TaskDone]);
  const hasTask3 = useMemo(() => isWorld1TaskDone(3), [isWorld1TaskDone]);

  /* ------------------------------------ */
  /* ✅ TASK HANDLERS */
  const handleTask1 = useCallback(() => {
    navigate("/world-1/task-1", { state: player });
  }, [navigate, player]);

  const handleTask2 = useCallback(() => {
    navigate("/world-1/task-2", { state: player });
  }, [navigate, player]);

  const handleTask3 = useCallback(() => {
    navigate("/world-1/task-3", { state: player });
  }, [navigate, player]);

  /* ------------------------------------ */
  /* ACHIEVEMENTS DATA (sum across tasks) */
  const dedupeBadges = (arr) => {
    const seen = new Set();
    const out = [];

    for (const b of arr || []) {
      const key =
        typeof b === "string"
          ? b
          : b?.id
          ? String(b.id)
          : b?.src
          ? String(b.src)
          : JSON.stringify(b);

      if (seen.has(key)) continue;
      seen.add(key);
      out.push(b);
    }
    return out;
  };

  const computeTotalsAndBadges = () => {
    let totalPoints = 0;
    let totalCuriosityPoints = 0;
    let badges = [];

    const scores = safeParse("yd_scores");
    if (scores && typeof scores === "object") {
      if (typeof scores.totalPoints === "number") totalPoints = scores.totalPoints;
      if (typeof scores.totalCuriosityPoints === "number")
        totalCuriosityPoints = scores.totalCuriosityPoints;
      if (Array.isArray(scores.badges)) badges = scores.badges;
      return { totalPoints, totalCuriosityPoints, badges };
    }

    const progress = safeParse("yd_progress");
    if (progress?.worlds) {
      const worlds = progress.worlds;

      Object.values(worlds).forEach((w) => {
        const tasks = w?.tasks || w?.taskResults || {};
        Object.values(tasks).forEach((t) => {
          if (!t) return;
          if (typeof t.points === "number") totalPoints += t.points;
          if (typeof t.curiosityPoints === "number")
            totalCuriosityPoints += t.curiosityPoints;
          if (Array.isArray(t.badges)) badges.push(...t.badges);
        });
      });

      badges = dedupeBadges(badges);
      return { totalPoints, totalCuriosityPoints, badges };
    }

    const results = safeParse("yd_task_results");
    if (Array.isArray(results)) {
      results.forEach((t) => {
        if (typeof t?.points === "number") totalPoints += t.points;
        if (typeof t?.curiosityPoints === "number")
          totalCuriosityPoints += t.curiosityPoints;
        if (Array.isArray(t?.badges)) badges.push(...t.badges);
      });

      badges = dedupeBadges(badges);
      return { totalPoints, totalCuriosityPoints, badges };
    }

    // fallback per-task keys
    const t1 = safeParse("yd_world1_task1");
    const t2 = safeParse("yd_world1_task2");
    const t3 = safeParse("yd_world1_task3");

    [t1, t2, t3].forEach((t) => {
      if (!t) return;
      if (typeof t.points === "number") totalPoints += t.points;
      if (typeof t.curiosityPoints === "number") totalCuriosityPoints += t.curiosityPoints;
      if (Array.isArray(t.badges)) badges.push(...t.badges);
    });

    badges = dedupeBadges(badges);
    return { totalPoints, totalCuriosityPoints, badges };
  };

  const [achOpen, setAchOpen] = useState(false);

  const { totalPoints, totalCuriosityPoints, badges } = useMemo(() => {
    return computeTotalsAndBadges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achOpen, progressTick]);

  const resolveBadgeSrc = (b) => {
    if (typeof b === "string") {
      if (b.startsWith("http://") || b.startsWith("https://") || b.startsWith("/")) return b;
      return `${process.env.PUBLIC_URL}/badges/${b}`;
    }
    if (b?.src) {
      if (b.src.startsWith("http://") || b.src.startsWith("https://") || b.src.startsWith("/"))
        return b.src;
      return `${process.env.PUBLIC_URL}/badges/${b.src}`;
    }
    return `${process.env.PUBLIC_URL}/badges/badge-placeholder.png`;
  };

  /* ------------------------------------ */
  /* CLOSE BEHAVIOUR: click outside + ESC */
  const achBtnRef = useRef(null);
  const achPanelRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && achOpen) setAchOpen(false);
    };

    const onDocMouseDown = (e) => {
      if (!achOpen) return;

      const btn = achBtnRef.current;
      const panel = achPanelRef.current;

      const clickedInsideBtn = btn && btn.contains(e.target);
      const clickedInsidePanel = panel && panel.contains(e.target);

      if (!clickedInsideBtn && !clickedInsidePanel) setAchOpen(false);
    };

    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDocMouseDown);

    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDocMouseDown);
    };
  }, [achOpen]);

  return (
    <div className={styles.screen} style={bgStyle}>
      <div className={styles.overlay}>
        {/* ✅ TOP RIGHT: achievements icon button */}
        <button
          ref={achBtnRef}
          type="button"
          className={styles.achBtn}
          onClick={() => setAchOpen((v) => !v)}
          aria-label="Achievements"
          aria-expanded={achOpen ? "true" : "false"}
        >
          <img src={achievementIcon} alt="" className={styles.achIcon} />
        </button>

        {/* ✅ POPOVER PANEL */}
        {achOpen && (
          <div ref={achPanelRef} className={styles.achPanel} role="dialog" aria-modal="false">
            <div className={styles.achRow}>
              <span className={styles.achLabel}>TOTAL POINTS:</span>
              <span className={styles.achValue}>{totalPoints}</span>
            </div>

            <div className={styles.achRow}>
              <span className={styles.achLabel}>TOTAL CURIOSITY POINTS:</span>
              <span className={styles.achValue}>{totalCuriosityPoints}</span>
            </div>

            <div className={styles.achSubTitle}>MY BADGES:</div>

            <div className={styles.badgeRow}>
              {badges && badges.length > 0 ? (
                badges.map((b, idx) => (
                  <img
                    key={(typeof b === "string" ? b : b?.id || b?.src || idx) + "_" + idx}
                    src={resolveBadgeSrc(b)}
                    alt=""
                    className={styles.badgeImg}
                    loading="lazy"
                  />
                ))
              ) : (
                <div className={styles.badgeEmpty}>No badges yet.</div>
              )}
            </div>
          </div>
        )}

        {/* LEFT rail */}
        <div className={styles.taskRail}>
          {/* TASK 1 */}
          <div className={styles.taskItem}>
            <button
              type="button"
              className={styles.taskIconWrap}
              onClick={handleTask1}
              aria-label="Task 1"
            >
              <img src={task1Img} alt="Task 1" className={styles.taskIcon} />
            </button>

            <button
              type="button"
              className={[styles.taskBtn, styles.taskBtnEnabled, styles.taskBtnPulse].join(" ")}
              onClick={handleTask1}
            >
              START TASK 1
            </button>
          </div>
{/* TASK 2 (enabled) */}
<div className={styles.taskItem}>
  <button
    type="button"
    className={styles.taskIconWrap}
    onClick={handleTask2}
    aria-label="Task 2"
  >
    <img src={task2Img} alt="Task 2" className={styles.taskIcon} />
  </button>

  <button
    type="button"
    className={[styles.taskBtn, styles.taskBtnEnabled].join(" ")}
    onClick={handleTask2}
  >
    START TASK 2
  </button>
</div>

{/* TASK 3 (enabled) */}
<div className={styles.taskItem}>
  <button
    type="button"
    className={styles.taskIconWrap}
    onClick={handleTask3}
    aria-label="Task 3"
  >
    <img src={task3Img} alt="Task 3" className={styles.taskIcon} />
  </button>

  <button
    type="button"
    className={[styles.taskBtn, styles.taskBtnEnabled].join(" ")}
    onClick={handleTask3}
  >
    START TASK 3
  </button>
</div>


          {/* TASK 4 (disabled for now) */}
          <div className={styles.taskItem}>
            <button
              type="button"
              className={[styles.taskIconWrap, styles.taskIconDisabled].join(" ")}
              disabled
              aria-label="Task 4 locked"
            >
              <img src={task4Img} alt="Task 4" className={styles.taskIcon} />
            </button>

            <button
              type="button"
              className={[styles.taskBtn, styles.taskBtnDisabled].join(" ")}
              disabled
            >
              START TASK 4
            </button>
          </div>
        </div>

        {/* Character */}
        <div className={styles.characterWrap} aria-hidden="true">
          <img src={characterSrc} alt="" className={styles.characterImg} />
        </div>
      </div>
    </div>
  );
}
