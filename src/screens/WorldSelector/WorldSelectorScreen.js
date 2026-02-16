import React, { useMemo, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./WorldSelectorScreen.module.css";

export default function WorldSelectorScreen() {
  const navigate = useNavigate();
  const location = useLocation();

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

  const bgUrl = `${process.env.PUBLIC_URL}/backgrounds/firstbg3.png`;
  const bgStyle = useMemo(() => ({ "--bg": `url(${bgUrl})` }), [bgUrl]);

  const femaleSrc = `${process.env.PUBLIC_URL}/characters/female.png`;
  const maleSrc = `${process.env.PUBLIC_URL}/characters/male.png`;
  const characterSrc = player.character === "male" ? maleSrc : femaleSrc;

  const nameUpper = (player.name || "PLAYER").toUpperCase();

  // ✅ typing for world description
  const fullWorldDesc =
    "Democracy is more than elections and slogans.\n" +
    "It is a system of rules, rights, and responsibilities that shapes everyday life.\n\n" +
    "In this world, you will explore how democracy works in practice.\n" +
    "You will learn how decisions are made, who holds power, and where citizens can influence outcomes.\n\n" +
    "Through real situations and thoughtful choices, you will recognize democratic principles\n" +
    "and practice responding when fairness, participation, or rights are challenged.\n\n" +
    "Complete this world to build a strong foundation for everything that follows.";

  const [worldDesc, setWorldDesc] = useState("");
  const [descDone, setDescDone] = useState(false);
  const [playEnabled, setPlayEnabled] = useState(false);
  const [skipUsed, setSkipUsed] = useState(false); // ✅ hide skip after click

  const typingIntervalRef = useRef(null);
  const enableTimeoutRef = useRef(null);

  const DESC_SPEED_MS = 14;
  const ENABLE_DELAY_MS = 800;

  const finishTypingInstant = () => {
    // ✅ hide skip like on setup screen
    setSkipUsed(true);

    if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
    if (enableTimeoutRef.current) clearTimeout(enableTimeoutRef.current);

    setWorldDesc(fullWorldDesc);
    setDescDone(true);
    setPlayEnabled(true);
  };

  useEffect(() => {
    let i = 0;

    setWorldDesc("");
    setDescDone(false);
    setPlayEnabled(false);
    setSkipUsed(false);

    typingIntervalRef.current = setInterval(() => {
      i += 1;
      setWorldDesc(fullWorldDesc.slice(0, i));

      if (i >= fullWorldDesc.length) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;

        setDescDone(true);
        enableTimeoutRef.current = setTimeout(() => {
          setPlayEnabled(true);
        }, ENABLE_DELAY_MS);
      }
    }, DESC_SPEED_MS);

    return () => {
      if (typingIntervalRef.current) clearInterval(typingIntervalRef.current);
      if (enableTimeoutRef.current) clearTimeout(enableTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ PLAY -> World1TaskSelectorScreen (/world-1)
  const handlePlayWorld = () => {
    if (!playEnabled) return;

    navigate("/world-1", {
      state: {
        ...player,
        world: 1,
      },
    });
  };

  /* ---------------------------------- */
  /* COMING SOON: FIRST LOCKS, THEN TEXT */
  const comingSoonText = "MORE WORLDS ARE COMING SOON";
  const [visibleLocks, setVisibleLocks] = useState(0);
  const [comingSoonTyped, setComingSoonTyped] = useState("");
  const [shakeIndex, setShakeIndex] = useState(null);

  const locksIntervalRef = useRef(null);
  const comingSoonTimeoutRef = useRef(null);
  const comingSoonTypingRef = useRef(null);

  useEffect(() => {
    setVisibleLocks(0);
    setComingSoonTyped("");
    setShakeIndex(null);

    return () => {
      if (locksIntervalRef.current) clearInterval(locksIntervalRef.current);
      if (comingSoonTimeoutRef.current) clearTimeout(comingSoonTimeoutRef.current);
      if (comingSoonTypingRef.current) clearInterval(comingSoonTypingRef.current);
    };
  }, []);

  useEffect(() => {
    if (!descDone) return;

    let index = 0;
    locksIntervalRef.current = setInterval(() => {
      index += 1;
      setVisibleLocks(index);

      if (index >= 3) {
        clearInterval(locksIntervalRef.current);
        locksIntervalRef.current = null;

        comingSoonTimeoutRef.current = setTimeout(() => {
          let j = 0;
          comingSoonTypingRef.current = setInterval(() => {
            j += 1;
            setComingSoonTyped(comingSoonText.slice(0, j));
            if (j >= comingSoonText.length) {
              clearInterval(comingSoonTypingRef.current);
              comingSoonTypingRef.current = null;
            }
          }, 40);
        }, 250);
      }
    }, 220);

    return () => {
      if (locksIntervalRef.current) clearInterval(locksIntervalRef.current);
      if (comingSoonTimeoutRef.current) clearTimeout(comingSoonTimeoutRef.current);
      if (comingSoonTypingRef.current) clearInterval(comingSoonTypingRef.current);
    };
  }, [descDone, comingSoonText]);

  const handleLockClick = (i) => {
    setShakeIndex(i);
    setTimeout(() => setShakeIndex(null), 450);
  };

  const showComingSoonCaret =
    comingSoonTyped.length > 0 && comingSoonTyped.length < comingSoonText.length;

  return (
    <div className={styles.screen} style={bgStyle}>
      <div className={styles.overlay}>
        <h1 className={styles.title}>HI {nameUpper} SELECT A WORLD TO PLAY IN</h1>

        <div className={styles.worldCard}>
          {/* LEFT */}
          <div className={styles.worldLeft}>
            <div className={styles.worldImageWrap}>
              <img
                src={`${process.env.PUBLIC_URL}/worlds/world1.png`}
                alt="World 1"
                className={styles.worldImage}
              />
            </div>

            <div className={styles.worldLabel}>WORLD 1 - DEMOCRACY</div>
          </div>

          {/* RIGHT */}
          <div className={styles.worldRight}>
            {/* ✅ SKIP disappears after click */}
            {!skipUsed && !descDone && (
              <button
                type="button"
                className={styles.skipLink}
                onClick={finishTypingInstant}
                aria-label="Skip typing"
              >
                SKIP
              </button>
            )}

            <p className={styles.worldDesc}>
              {worldDesc}
              {!descDone && <span className={styles.caret} aria-hidden="true" />}
            </p>

            <button
              type="button"
              className={styles.playBtn}
              disabled={!playEnabled}
              onClick={handlePlayWorld}
            >
              PLAY
            </button>
          </div>
        </div>

        <div className={styles.comingSoonBar}>
          <div className={styles.comingSoonInner}>
            <div className={styles.lockRow}>
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleLockClick(i)}
                  className={[
                    styles.lockCard,
                    visibleLocks > i ? styles.lockVisible : "",
                    shakeIndex === i ? styles.lockShake : "",
                  ].join(" ")}
                  aria-label="Locked world"
                >
                  <img
                    src={`${process.env.PUBLIC_URL}/ui/lock.svg`}
                    alt=""
                    className={styles.lockIcon}
                  />
                </button>
              ))}
            </div>

            <span className={styles.comingSoonText}>
              {comingSoonTyped}
              {showComingSoonCaret && (
                <span className={styles.caret} aria-hidden="true" />
              )}
            </span>
          </div>
        </div>

        <div
          className={[
            styles.playerCrop,
            player.character === "male" ? styles.playerCropMale : "",
          ].join(" ")}
          aria-hidden="true"
        >
          <img src={characterSrc} alt="" className={styles.playerImg} />
        </div>
      </div>
    </div>
  );
}
