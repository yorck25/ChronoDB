import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Header} from "../../components/databaseBrowser/header";
import {useProjectContext} from "../../contexts/projects.context.tsx";
import type {IProjectWithUsers} from "../../models/projects.models.ts";
import {DatabaseStructure} from "../../components/databaseBrowser/databaseStructure";
import styles from './style.module.scss';

export const DatabaseBrowser = () => {
    const {getProjectById, fetchProjectById} = useProjectContext();
    const {projectId} = useParams();

    const [project, setProject] = useState<IProjectWithUsers | undefined>();

    const fetchProject = async (id: number) => {
        const res = await fetchProjectById(id);
        if (res) setProject(res);
        return res;
    };

    useEffect(() => {
        const id = Number(projectId);
        if (!Number.isFinite(id) || id <= 0) return;

        const cached = getProjectById(id);
        if (cached) {
            setProject(cached);
            return;
        }

        fetchProject(id);
    }, [projectId, getProjectById, fetchProjectById]);

    return (
        <>
            {project ? (
                <div className={styles['database-browser']}>
                    <Header project={project.project}/>

                    <div className={styles['database-browser-body']}>
                        <DatabaseStructure project={project.project}/>

                        <div>
                            Details
                        </div>
                    </div>
                </div>
            ) : (
                <p>Loading…</p>
            )}
        </>
    );
};
