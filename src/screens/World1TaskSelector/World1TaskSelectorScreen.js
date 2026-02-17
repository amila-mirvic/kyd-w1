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

  /* ------------------------------------ */
  /* ✅ totals + badges */
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

  const [progressTick, setProgressTick] = useState(0);
  useEffect(() => {
    const bump = () => setProgressTick((v) => v + 1);
    const onFocus = () => bump();

    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

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

  /* ------------------------------------ */
  /* ✅ TASK HANDLERS (ALL ENABLED, NO LOCKING) */
  const handleTask1 = useCallback(() => {
    navigate("/world-1/task-1", { state: player });
  }, [navigate, player]);

  const handleTask2 = useCallback(() => {
    navigate("/world-1/task-2", { state: player });
  }, [navigate, player]);

  const handleTask3 = useCallback(() => {
    navigate("/world-1/task-3", { state: player });
  }, [navigate, player]);

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

          {/* TASK 2 */}
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

          {/* TASK 3 */}
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

          {/* TASK 4 (neutral / not implemented) */}
          <div className={styles.taskItem}>
            <button
              type="button"
              className={[styles.taskIconWrap, styles.taskIconDisabled].join(" ")}
              disabled
              aria-label="Task 4 (coming soon)"
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
