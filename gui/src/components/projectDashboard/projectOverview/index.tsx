import {useMemo, useState} from "preact/hooks";
import styles from "./style.module.scss";
import {useProjectContext} from "../../../contexts/projects.context.tsx";
import type {IProjectWithUsers} from "../../../models/projects.models.ts";
import {StatCard} from "../../statCard";
import {Badge} from "../../ui/badge";

interface IProps {
    projectId?: number;
}

export const ProjectOverview = ({projectId}: IProps) => {
    const {projects, getProjectById} = useProjectContext();

    const [loading, setLoading] = useState<boolean>(false);

    const project: IProjectWithUsers | undefined = useMemo(() => {
        setLoading(true);

        if (!projects || projects.length === 0) {
            setLoading(false);
            return undefined;
        }

        if (projectId != null) {
            setLoading(false);
            return getProjectById(projectId)
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
                    <div className={styles["overview-headline"]}>{project.project.name}</div>
                    <Badge tone="neutral" text={project.project.visibility}/>
                </div>

                <div className={styles['section-right']}>
                    <div className={styles["overview-project-id"]}>
                        Project-ID: <span>{project.project.id}</span>
                    </div>
                </div>
            </div>

            <div className={styles["stat-cards-container"]}>
                <StatCard label={"Owner ID"} value={project.project.ownerId.toString()}/>
                <StatCard label={"Connection"} value={"#" + project.project.connectionType.toString()}/>
                <StatCard label={"Members"} value={project.users.totalCount.toString()} hint={"Assigned to this project"}/>
                <StatCard label={"Last Updated"} value={"15m ago"} hint={"04/24/2024, 10:40 AM"}/>
            </div>
        </div>
    );
};