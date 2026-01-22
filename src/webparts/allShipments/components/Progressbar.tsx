import * as React from "react";
import styles from "./AllShipments.module.scss";
// import styles from './ProgressBar.module.scss';
let img: any = require("../../Global/Images/caroship.svg");

interface ProgressBarProps {
  percentageComplete: number;
  podLocation: string;
  polLocation: string;
  podActual: boolean;
  polActual: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percentageComplete,
  podLocation,
  polLocation,
  polActual,
  podActual,
}) => {
  return (
    //new

    <div className={styles.progressContainer}>
      <div className={styles.locations}>
        <span>{polLocation}</span>
        <span>{podLocation}</span>
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${percentageComplete}%` }}
        ></div>
        <div
          className={`${styles.startPoint} ${polActual ? styles.filled : ""}`}
        ></div>
        <div
          className={`${styles.endPoint} ${podActual ? styles.filled : ""}`}
        ></div>
        {percentageComplete != 100 && (
          <img
            className={styles.progressImage}
            src={`${img}`}
            alt="Progress"
            style={{
              left: `${percentageComplete}%`,
              // transform: "translateX(-50%)",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
