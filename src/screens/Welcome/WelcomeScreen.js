import React from "react";
import { useNavigate } from "react-router-dom";
import GameLayout from "../../components/Layout/GameLayout";
import styles from "./WelcomeScreen.module.css";

export default function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <GameLayout backgroundImage="/backgrounds/firstbg.png">
      <div className={styles.wrapper}>
        <div className={styles.heroCard}>
          <img src="/logo.png" alt="Your Democracy" className={styles.logo} />

    

          <button
            className={styles.playBtn}
            onClick={() => navigate("/setup")}
            type="button"
          >
            START
          </button>
        </div>

        {/* ✅ jedna slika koja prelazi preko boxa */}
        <img
          src="/characters/both.png"
          className={styles.characters}
          alt=""
          aria-hidden="true"
        />
      </div>
    </GameLayout>
  );
}
