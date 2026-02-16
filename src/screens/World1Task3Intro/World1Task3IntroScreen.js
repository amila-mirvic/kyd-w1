import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./World1Task3IntroScreen.module.css";

export default function World1Task3IntroScreen() {
  const location = useLocation();
  const navigate = useNavigate();

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

  // ✅ assets
  const bg = `${process.env.PUBLIC_URL}/world1/task3/bg.png`;
  const judge = `${process.env.PUBLIC_URL}/world1/task3/judge.png`;

  const quote =
    "“IN DEMOCRACY, POWER HAS LIMITS. YOUR JOB IS TO TEST DECISIONS: ARE THEY FAIR, LEGAL, AND RESPECTFUL OF RIGHTS?”";

  const [typed, setTyped] = useState("");
  const [phase, setPhase] = useState("typing"); // typing -> instructions -> go

  // ✅ typing (width + tempo kao figma feeling)
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setTyped(quote.slice(0, i));
      if (i >= quote.length) {
        clearInterval(t);
        setPhase("instructions");
      }
    }, 18);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ auto flow: typing -> instructions (kratko) -> task3
  useEffect(() => {
    if (phase !== "instructions") return;

    const toGame = setTimeout(() => {
      navigate("/world-1/task-3", { state: player });
    }, 1400);

    return () => clearTimeout(toGame);
  }, [phase, navigate, player]);

  return (
    <div className={styles.screen} style={{ backgroundImage: `url(${bg})` }}>
      <div className={styles.overlay} />

      {/* ✅ judge (scaled down like figma) */}
      <img className={styles.judge} src={judge} alt="" />

      {/* ✅ caption box (typing) */}
      <div className={styles.captionWrap}>
        <div className={styles.caption}>
          <span>{typed}</span>
          {phase === "typing" && <span className={styles.caret}>|</span>}
        </div>
      </div>

      {/* ✅ instructions card (same copy as task1 instructions) */}
      {phase === "instructions" && (
        <div className={styles.instructionsCard}>
          <div className={styles.instructionsTitle}>INSTRUCTIONS</div>
          <div className={styles.instructionsList}>
            <div className={styles.row}>
              <span className={styles.dotGreen} />
              <span>YES</span>
            </div>
            <div className={styles.row}>
              <span className={styles.dotYellow} />
              <span>NOT SURE</span>
            </div>
            <div className={styles.row}>
              <span className={styles.dotRed} />
              <span>NO</span>
            </div>
          </div>
          <div className={styles.autoNote}>Starting…</div>
        </div>
      )}
    </div>
  );
}
