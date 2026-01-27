import {useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import {Header} from "../../components/databaseBrowser/header";
import {useProjectContext} from "../../contexts/projects.context.tsx";
import type {IProjectWithUsers} from "../../models/projects.models.ts";
import {DatabaseStructure} from "../../components/databaseBrowser/databaseStructure";
import styles from './style.module.scss';
import {DetailTabBar} from "../../components/databaseBrowser/detail/detailTabBar";
import {BrowserTabType, useDbBrowserContext} from "../../contexts/dbBrowser.context.tsx";
import {QueryTab} from "../../components/databaseBrowser/detail/queryTab";

export const DatabaseBrowser = () => {
    const {getProjectById, fetchProjectById} = useProjectContext();
    const {activeTab, browserTabs, getActiveTabFromId} = useDbBrowserContext();
    const {projectId} = useParams();

    const [project, setProject] = useState<IProjectWithUsers | undefined>();
    const [loading, setLoading] = useState(true);

    const numericProjectId = useMemo(() => {
        const id = Number(projectId);
        return Number.isFinite(id) && id > 0 ? id : undefined;
    }, [projectId]);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            if (!numericProjectId) {
                setProject(undefined);
                setLoading(false);
                return;
            }

            const cached = getProjectById(numericProjectId);
            if (cached) {
                setProject(cached);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await fetchProjectById(numericProjectId);
                if (cancelled) return;
                setProject(res ?? undefined);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [numericProjectId, getProjectById, fetchProjectById]);

    const activeTabObj = useMemo(() => {
        return getActiveTabFromId()
    }, [activeTab, browserTabs]);

    if (loading && !project) {
        return <p>Loading…</p>
    }

    if (!project) {
        return <p>Project not found.</p>
    }

    return (
        <div className={styles['database-browser']}>
            <Header project={project.project}/>

            <div className={styles['database-browser-body']}>
                <DatabaseStructure project={project.project}/>

                <div className={styles['database-browser-detail-container']}>
                    <DetailTabBar/>

                    {activeTabObj && (
                        <div>
                            {activeTabObj.type === BrowserTabType.QUERY && (
                                <QueryTab project={project.project}/>
                            )}

                            {activeTabObj.type === BrowserTabType.OVERVIEW && (
                                <div>Overview</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};