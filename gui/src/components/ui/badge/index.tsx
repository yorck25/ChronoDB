import styles from "./style.module.scss";

interface IBadgeProps {
  tone?: "neutral" | "positive" | "warning" | "negative";
  text?: string;
}

export const Badge = ({ tone, text }: IBadgeProps) => {

  if(tone == "neutral") {
    return (
      <div className={`${styles.badge} ${styles.neutral}`}>
        {text}
      </div>
    )
  }

  return (
    <div className={styles["badge"]}>
      {text}
    </div>
  );
}