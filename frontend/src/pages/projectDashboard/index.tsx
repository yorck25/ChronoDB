import styles from './style.module.scss';
import {useNavigate, useParams} from "react-router-dom";
import {useProjectContext} from "../../contexts/projects.context.tsx";
import {useEffect, useState} from "react";
import type {IProjectWithUsers} from "../../models/projects.models.ts";
import {ProjectOverview} from "../../components/projectDashboard/projectOverview";
import {ProjectSettings} from "../../components/projectDashboard/projectSettings";

export const ProjectDashboard = () => {
    const {projectId} = useParams();
    const {projects, getProjectById, ensureProjectLoaded} = useProjectContext();
    const [_, setCurrentProject] = useState<IProjectWithUsers | undefined>();
    const [activeTab, setActiveTab] = useState<string>("Overview");


    useEffect(() => {
        if (!projectId) return;

        const id = Number(projectId);

        if (projects === undefined) return;

        const existing = getProjectById(id);
        if (existing) {
            setCurrentProject(existing);
        } else {
            ensureProjectLoaded(id).then((fetched) => {
                if (fetched) setCurrentProject(fetched);
            });
        }
    }, [projectId, projects]);

    const getNavigationItemClass = (id: string) => {
        return `${styles.navigation_bar_item_list_item} ${
            activeTab === id ? styles.active_tab : ""
        }`
    }

    return (
        <div className={styles.project_dashboard_page}>
            <div className={styles.header}>
                <h1 className={styles.title}>Project Dashboard</h1>
            </div>

            <nav className={styles.navigation_bar}>
                <ul className={styles.navigation_bar_item_list}>
                    <li
                        className={getNavigationItemClass("Overview")}
                        onClick={() => setActiveTab("Overview")}
                    >
                        Overview
                    </li>
                    <li
                        className={getNavigationItemClass("Database")}
                        onClick={() => setActiveTab("Database")}
                    >
                        Database
                    </li>
                    <li
                        className={getNavigationItemClass("Members")}
                        onClick={() => setActiveTab("Members")}
                    >
                        Members
                    </li>
                    <li
                        className={getNavigationItemClass("Tasks")}
                        onClick={() => setActiveTab("Tasks")}
                    >
                        Tasks (+99)
                    </li>
                    <li
                        className={getNavigationItemClass("Discussion")}
                        onClick={() => setActiveTab("Discussion")}
                    >
                        Discussion (05)
                    </li>
                    <li
                        className={getNavigationItemClass("Settings")}
                        onClick={() => setActiveTab("Settings")}
                    >
                        Settings
                    </li>
                </ul>
            </nav>

            <div className={styles.content_container}>
                {activeTab === "Overview" && (
                    <ProjectOverview projectId={Number(projectId)}/>
                )}

                {activeTab === "Database" && (
                    <DatabaseBrowserNavigate/>
                )}

                {activeTab === "Members" && (
                    <>Not implemented yet.</>
                )}

                {activeTab === "Tasks" && (
                    <>Not implemented yet.</>
                )}

                {activeTab === "Discussion" && (
                    <>Not implemented yet.</>
                )}

                {activeTab === "Settings" && (
                    <ProjectSettings projectId={Number(projectId)}/>
                )}
            </div>
        </div>
    );
};

export const DatabaseBrowserNavigate = () => {
    const navigate = useNavigate();
    useEffect(() => {
        navigate(location.pathname + `/database-browser`);
    }, []);

    return (
        <>Getting routed.</>
    )
}