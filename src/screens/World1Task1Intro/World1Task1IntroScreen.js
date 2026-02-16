import React, { useMemo, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./World1Task1IntroScreen.module.css";

export default function World1Task1IntroScreen() {
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
  const bgUrl = `${process.env.PUBLIC_URL}/world1/task1bg.png`;
  const bgStyle = useMemo(() => ({ "--bg": `url(${bgUrl})` }), [bgUrl]);

  // ✅ character
  const femaleSrc = `${process.env.PUBLIC_URL}/characters/female.png`;
  const maleSrc = `${process.env.PUBLIC_URL}/characters/male.png`;
  const characterSrc = player.character === "male" ? maleSrc : femaleSrc;

  // ✅ icons (public/world1/task1/)
  const correctIcon = `${process.env.PUBLIC_URL}/world1/task1/correct.png`;
  const middleIcon = `${process.env.PUBLIC_URL}/world1/task1/middle.png`;
  const wrongIcon = `${process.env.PUBLIC_URL}/world1/task1/wrong.png`;

  const whyIcon = `${process.env.PUBLIC_URL}/world1/task1/why.png`;
  const pointsIcon = `${process.env.PUBLIC_URL}/world1/task1/points.png`;
  const curiosityIcon = `${process.env.PUBLIC_URL}/world1/task1/curiositypoints.png`;

  const [step, setStep] = useState(0);
  const handleNext = () => setStep(1);

  const handleStart = () => {
    // ✅ go to Task 1 screen
    navigate("/world-1/task-1", { state: player });
  };

  /* --------------------------------------- */
  /* INTRO OVERLAY: typing -> HOLD -> FADE -> REVEAL UI */
  const introFull =
    "You reach a giant stone door: “THE DEMOCRACY GATE.”\n" +
    "Many people use the word democracy… but do they mean the same thing?\n" +
    "To pass, you must separate myths from meaning.";

  const [introText, setIntroText] = useState("");
  const [introTypingDone, setIntroTypingDone] = useState(false);
  const [introFading, setIntroFading] = useState(false);
  const [introHidden, setIntroHidden] = useState(false);

  // ✅ show instructions + character only after intro is gone
  const [showUI, setShowUI] = useState(false);
  const [uiTextIn, setUiTextIn] = useState(false);

  const typingRef = useRef(null);
  const holdRef = useRef(null);
  const fadeRef = useRef(null);
  const revealRefs = useRef([]);

  const TYPE_MS = 84; // sporije
  const HOLD_MS = 2500; // how long it stays before fade
  const FADE_MS = 700; // fade duration
  const REVEAL_DELAY = 120; // short delay after fade

  useEffect(() => {
    let i = 0;

    setIntroText("");
    setIntroTypingDone(false);
    setIntroFading(false);
    setIntroHidden(false);

    setShowUI(false);
    setUiTextIn(false);

    typingRef.current = setInterval(() => {
      i += 1;
      setIntroText(introFull.slice(0, i));

      if (i >= introFull.length) {
        clearInterval(typingRef.current);
        typingRef.current = null;
        setIntroTypingDone(true);

        holdRef.current = setTimeout(() => {
          setIntroFading(true);

          fadeRef.current = setTimeout(() => {
            setIntroHidden(true);

            // ✅ reveal: prvo se pojavi box, pa onda text
            revealRefs.current.push(setTimeout(() => setShowUI(true), REVEAL_DELAY));
            revealRefs.current.push(setTimeout(() => setUiTextIn(true), REVEVEAL_DELAY_SAFE(REVEAL_DELAY) + 240));
          }, FADE_MS);
        }, HOLD_MS);
      }
    }, TYPE_MS);

    return () => {
      if (typingRef.current) clearInterval(typingRef.current);
      if (holdRef.current) clearTimeout(holdRef.current);
      if (fadeRef.current) clearTimeout(fadeRef.current);
      revealRefs.current.forEach((t) => clearTimeout(t));
      revealRefs.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.screen} style={bgStyle}>
      <div className={styles.overlay}>
        {/* INTRO LAYER */}
        {!introHidden && (
          <div className={[styles.introLayer, introFading ? styles.introFadeOut : ""].join(" ")}>
            <div className={styles.introText}>
              {introText}
              {!introTypingDone && <span className={styles.introCaret} aria-hidden="true" />}
            </div>
          </div>
        )}

        {/* MAIN UI (uses YOUR CSS classes for instructions + character) */}
        {showUI && (
          <>
            {/* CHARACTER (tvoj css) */}
            <div
              className={[styles.characterWrap, styles.uiReveal, uiTextIn ? styles.uiTextIn : ""].join(" ")}
              aria-hidden="true"
            >
              <img src={characterSrc} alt="" className={styles.characterImg} />
            </div>

            {/* INFO CARD (tvoj css) */}
            <div className={[styles.infoCard, styles.uiReveal, uiTextIn ? styles.uiTextIn : ""].join(" ")}>
              {step === 0 ? (
                <>
                  <div className={styles.cardTitle}>
                    YOU WILL SEE 10 STATEMENTS. FOR EACH YOU MUST CHOOSE ONE OF 3 CATEGORIES
                  </div>

                  <div className={styles.rows}>
                    <div className={styles.row}>
                      <img className={styles.icon} src={correctIcon} alt="Correct" />
                      <div className={styles.rowText}>CORRECT - CORE TO DEMOCRACY</div>
                    </div>

                    <div className={styles.row}>
                      <img className={styles.icon} src={middleIcon} alt="Warning" />
                      <div className={styles.rowText}>WARNING - CAN EXIST IN DEMOCRACY, BUT NOT GUARANTEED</div>
                    </div>

                    <div className={styles.row}>
                      <img className={styles.icon} src={wrongIcon} alt="Wrong" />
                      <div className={styles.rowText}>WRONG - NOT DEMOCRACY / MYTH / RISK</div>
                    </div>
                  </div>

                  <button type="button" className={styles.actionBtn} onClick={handleNext}>
                    NEXT
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.cardTitle}>
                    YOU WILL GET 2 POINTS FOR CORRECT ANSWERS AND FOR WRONG YOU WILL NOT.
                    <br />
                    BY USING WHY BUTTON 3 TIMES YOU WILL GET 5 CURIOSITY POINTS
                  </div>

                  <div className={styles.rows}>
                    <div className={styles.row}>
                      <img className={styles.icon} src={whyIcon} alt="Why" />
                      <div className={styles.rowText}>WHY BUTTON</div>
                    </div>

                    <div className={styles.row}>
                      <img className={styles.icon} src={pointsIcon} alt="Points" />
                      <div className={styles.rowText}>POINTS</div>
                    </div>

                    <div className={styles.row}>
                      <img className={styles.icon} src={curiosityIcon} alt="Curiosity points" />
                      <div className={styles.rowText}>CURIOSITY POINTS</div>
                    </div>
                  </div>

                  <button type="button" className={styles.actionBtn} onClick={handleStart}>
                    START
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Small helper so we don't accidentally typo the constant name.
 * (keeps your logic the same, just prevents REVEVEAL_DELAY typo issues)
 */
function REVEVEAL_DELAY_SAFE(n) {
  return n;
}
