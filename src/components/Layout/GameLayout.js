import React from "react";
import styles from "./GameLayout.module.css";

const BASE_W = 1920;
const BASE_H = 1080;

export default function GameLayout({ backgroundImage, children }) {
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setScale(Math.min(w / BASE_W, h / BASE_H));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  return (
    <div
      className={styles.viewport}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
      }}
    >
      <div
        className={styles.stage}
        style={{
          width: BASE_W,
          height: BASE_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
