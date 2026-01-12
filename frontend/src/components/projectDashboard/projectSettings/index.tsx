import {useProjectContext} from "../../../contexts/projects.context.tsx";
import type {IProjectWithUsers} from "../../../models/projects.models.ts";
import {useMemo, useState} from "preact/hooks";
import styles from "./style.module.scss";

interface IProjectSettings {
    projectId?: number;
}

export const ProjectSettings = ({projectId}: IProjectSettings) => {
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
                <h2 className={styles["overview-headline"]}>Project Settings</h2>
                <p className={styles["muted-text"]}>Loading...</p>
            </div>
        )
    }

    if (!project) {
        return (
            <div className={styles["project-overview-container"]}>
                <h2 className={styles["overview-headline"]}>Project Settings</h2>
                <p className={styles["muted-text"]}>No project found.</p>
            </div>
        );
    }

    return (
        <div className={styles["project-settings-container"]}>
            <div className={styles["overview-header"]}>
                <h2 className={styles["overview-headline"]}>Settings</h2>
                <p className={styles["overview-sub-headline"]}>Update the project data and credentials.</p>
            </div>
        </div>
    )
}