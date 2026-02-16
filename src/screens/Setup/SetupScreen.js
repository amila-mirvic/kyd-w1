import React, { useMemo, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SetupScreen.module.css";

export default function SetupScreen() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [selected, setSelected] = useState(null); // null | "female" | "male"

  const fullDescription =
    "This game puts you in everyday situations where decisions, rights, and power matter.\n" +
    "You’ll explore how democracy works beyond elections, through choices, dilemmas, and actions that people face in real life.\n\n" +
    "You’ll sort ideas from myths, decide who should act, and choose how to respond when rules, rights, or fairness are tested.\n" +
    "There are no trick questions and no “perfect” players, only better understanding through thinking and reflection.\n\n" +
    "Your progress is shaped by the decisions you make.\n" +
    "Curiosity, responsibility, and participation will guide you forward.\n\n" +
    "Select a character and enter your name to begin.";

  const fullLabel = "ENTER YOUR NAME";

  const [descText, setDescText] = useState("");
  const [labelText, setLabelText] = useState("");
  const [formVisible, setFormVisible] = useState(false);

  // ✅ NEW: skip typing
  const [skipTyping, setSkipTyping] = useState(false);

  const DESC_SPEED_MS = 20;
  const AFTER_DESC_DELAY_MS = 650;
  const LABEL_SPEED_MS = 55;

  const bgStyle = useMemo(
    () => ({
      backgroundImage: `url(${process.env.PUBLIC_URL}/backgrounds/firstbg2.png)`,
    }),
    []
  );

  const femaleSrc = `${process.env.PUBLIC_URL}/characters/female.png`;
  const maleSrc = `${process.env.PUBLIC_URL}/characters/male.png`;

  const selectCharacter = (who) => {
    setSelected((prev) => (prev === who ? prev : who));
  };

  const femaleSelected = selected === "female";
  const maleSelected = selected === "male";

  // ✅ 1) typing effect: description -> wait -> show form
  useEffect(() => {
    // If skip clicked, instantly fill everything
    if (skipTyping) {
      setDescText(fullDescription);
      setFormVisible(true);
      setLabelText(fullLabel);
      return;
    }

    let i = 0;
    let showFormTimeout;

    const interval = setInterval(() => {
      i += 1;
      setDescText(fullDescription.slice(0, i));

      if (i >= fullDescription.length) {
        clearInterval(interval);

        showFormTimeout = setTimeout(() => {
          setFormVisible(true);
        }, AFTER_DESC_DELAY_MS);
      }
    }, DESC_SPEED_MS);

    return () => {
      clearInterval(interval);
      if (showFormTimeout) clearTimeout(showFormTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipTyping]);

  // ✅ 2) label typing starts AFTER form is visible
  useEffect(() => {
    if (!formVisible) return;

    // If skip clicked, label is already full
    if (skipTyping) {
      setLabelText(fullLabel);
      return;
    }

    let j = 0;
    const interval = setInterval(() => {
      j += 1;
      setLabelText(fullLabel.slice(0, j));
      if (j >= fullLabel.length) clearInterval(interval);
    }, LABEL_SPEED_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formVisible, skipTyping]);

  const canPlay = name.trim().length > 0 && selected !== null;

  const femaleShouldFloat = selected === null || (!femaleSelected && selected !== null);
  const maleShouldFloat = selected === null || (!maleSelected && selected !== null);

  const handlePlay = () => {
    if (!canPlay) return;

    const payload = { name: name.trim(), character: selected };
    localStorage.setItem("yd_player", JSON.stringify(payload));

    // ✅ go to world selector
    navigate("/world-select", { state: payload });
  };

  const handleSkip = () => {
    setSkipTyping(true);
  };

  return (
    <div className={styles.screen} style={bgStyle}>
      <div className={styles.overlay}>
        {/* LEFT CARD */}
        <div className={styles.heroCard}>
          {/* ✅ SKIP link (only while typing) */}
          {!skipTyping && descText.length < fullDescription.length && (
            <button type="button" className={styles.skipLink} onClick={handleSkip}>
              SKIP
            </button>
          )}

          <p className={styles.description}>
            {descText}
            {!skipTyping && descText.length < fullDescription.length && (
              <span className={styles.caret} aria-hidden="true" />
            )}
          </p>

          {formVisible && (
            <div className={styles.formBlock}>
              <label className={styles.label}>
                {labelText}
                {!skipTyping && labelText.length < fullLabel.length && (
                  <span className={styles.caret} aria-hidden="true" />
                )}
              </label>

              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=""
              />
            </div>
          )}

          <button
            className={styles.playBtn}
            type="button"
            disabled={!canPlay}
            onClick={handlePlay}
          >
            PLAY
          </button>
        </div>

        {/* RIGHT CHARACTERS */}
        <div className={styles.charactersArea} aria-label="Characters">
          <div className={styles.hitboxLayer} aria-hidden="true">
            <button
              type="button"
              className={[styles.hitbox, styles.femaleHitbox].join(" ")}
              onClick={() => selectCharacter("female")}
              tabIndex={-1}
            />
            <button
              type="button"
              className={[styles.hitbox, styles.maleHitbox].join(" ")}
              onClick={() => selectCharacter("male")}
              tabIndex={-1}
            />
          </div>

          <button
            type="button"
            onClick={() => selectCharacter("female")}
            className={[
              styles.characterBtn,
              styles.femaleBtn,
              femaleSelected ? styles.isSelected : "",
              maleSelected ? styles.isUnselected : "",
              femaleShouldFloat ? styles.float : "",
            ].join(" ")}
            aria-label="Female"
          >
            <div className={[styles.imgCrop, femaleSelected ? styles.cropSelected : ""].join(" ")}>
              <img
                className={[
                  styles.characterImg,
                  styles.femaleImg,
                  femaleSelected ? styles.imgSelected : "",
                ].join(" ")}
                src={femaleSrc}
                alt="Female character"
              />
            </div>
          </button>

          <button
            type="button"
            onClick={() => selectCharacter("male")}
            className={[
              styles.characterBtn,
              styles.maleBtn,
              maleSelected ? styles.isSelected : "",
              femaleSelected ? styles.isUnselected : "",
              maleShouldFloat ? styles.float : "",
            ].join(" ")}
            aria-label="Male"
          >
            <div className={[styles.imgCrop, maleSelected ? styles.cropSelected : ""].join(" ")}>
              <img
                className={[
                  styles.characterImg,
                  styles.maleImg,
                  maleSelected ? styles.imgSelected : "",
                ].join(" ")}
                src={maleSrc}
                alt="Male character"
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
