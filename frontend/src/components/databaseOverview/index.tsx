import { useMemo, useState } from "preact/hooks";
import styles from "./style.module.scss";
import { useProjectContext } from "../../contexts/projects.context";
import type { IProject } from "../../models/projects.models";
import { Badge } from "../ui/badge";
import { StatCard } from "../statCard";

interface IProps {
  projectId?: number;
}

export const DatabaseOverview = ({ projectId }: IProps) => {
  const { projects } = useProjectContext();

  const [loading, setLoading] = useState<boolean>(false);

  const project: IProject | undefined = useMemo(() => {
    setLoading(true);

    if (!projects || projects.length === 0) {
      setLoading(false);
      return undefined;
    }

    if (projectId != null) {
      const id = projectId != null ? Number(projectId) : undefined;
      setLoading(false);
      return projects.find(p => p.project.id === id)?.project;
    }

    setLoading(false);
    return undefined;
  }, [projects, projectId]);

  if (loading) {
    return (
      <div className={styles["project-overview-container"]}>
        <div className={styles["overview-headline"]}>Project Overview</div>
        <div className={styles["muted-text"]}>Loading...</div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className={styles["project-overview-container"]}>
        <div className={styles["overview-headline"]}>Project Overview</div>
        <div className={styles["muted-text"]}>No project found.</div>
      </div>
    );
  }

  return (
    <div className={styles["project-overview-container"]}>
      <div className={styles["overview-header"]}>
        <div className={styles['section-left']}>
          <div className={styles["overview-headline"]}>{project.name}</div>
          <Badge tone="neutral" text={project.visibility} />
        </div>

        <div className={styles['section-right']}>
          <div className={styles["overview-project-id"]}>
            Project-ID: <span>{project.id}</span>
          </div>
        </div>
      </div>

      <div className={styles["stat-cards-container"]}>
        <StatCard label={"Owner ID"} value={project.ownerId.toString()} />
        <StatCard label={"Connection"} value={"#" + project.connectionType.toString()} />
        <StatCard label={"Members"} value={"0"} hint={"Assigned to this project"} />
        <StatCard label={"Last Updated"} value={"15m ago"} hint={"04/24/2024, 10:40 AM"} />
      </div>
    </div>
  );
};