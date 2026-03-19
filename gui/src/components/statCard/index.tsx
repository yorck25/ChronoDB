import styles from "./style.module.scss";

interface IStatCardProps {
  label: string;
  value: string;
  hint?: string
}

export const StatCard = ({ label, value, hint }: IStatCardProps) => {
  return (
    <div className={styles["stat-card"]}>
      <div className={styles["stat-label"]}>{label}</div>
      <div className={styles["stat-value"]}>{value}</div>
      {hint && <div className={styles["stat-hint"]}>{hint}</div>}
    </div>
  )
}