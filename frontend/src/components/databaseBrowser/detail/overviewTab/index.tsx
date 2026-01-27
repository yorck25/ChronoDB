// OverviewTab.tsx
import {useEffect, useState} from "react";
import styles from "./style.module.scss";
import {QueryResult} from "../queryResult";
import type {IDatabaseQueryResult} from "../../../../models/database.models.ts";
import type {IProject} from "../../../../models/projects.models.ts";
import {QueryTab} from "../queryTab";
import {useDatabaseWorkerContext} from "../../../../contexts/databaseWorker.context.tsx";
import {useDbBrowserContext} from "../../../../contexts/dbBrowser.context.tsx";

interface IOverviewTabProps {
    project: IProject;
}

export enum Tab {
    Data = 0,
    Structure = 1,
    Indexes = 2,
    Relations = 3,
    SQL = 4,
}

interface ITabConfig {
    label: string;
    value: Tab;
    isActive: boolean;
}

export const OverviewTab = ({project}: IOverviewTabProps) => {
    const {executeQuery} = useDatabaseWorkerContext();
    const {getActiveTabFromId} = useDbBrowserContext();

    const [dataResponse, setDataResponse] = useState<
        IDatabaseQueryResult | undefined
    >(undefined);
    const [activeOverviewTab, setActiveOverviewTab] = useState<Tab>(Tab.Data);

    const tabs: ITabConfig[] = [
        {label: "Data", value: Tab.Data, isActive: true},
        {label: "Structure", value: Tab.Structure, isActive: false},
        {label: "Indexes", value: Tab.Indexes, isActive: false},
        {label: "Relations", value: Tab.Relations, isActive: false},
        {label: "SQL", value: Tab.SQL, isActive: true},
    ];

    useEffect(() => {
        if (activeOverviewTab !== Tab.Data) return;

        const tab = getActiveTabFromId();
        if (!tab) return;

        const query = `SELECT *
                       FROM ${tab.schemaName}.${tab.tableName}
                       LIMIT 500`;

        executeQuery(project.id, query).then(r => {
            setDataResponse(r);
        })
    }, [activeOverviewTab]);

    return (
        <div className={styles["overview-tab"]}>
            <div className={styles["tabs"]}>
                {tabs.map((tab) => (
                    <>
                        {tab.isActive && (
                            <button
                                key={tab.value}
                                type="button"
                                className={`${styles["tab"]} ${tab.value == activeOverviewTab && styles["active"]}`}
                                onClick={() => setActiveOverviewTab(tab.value)}
                            >
                                {tab.label}
                            </button>
                        )}
                    </>
                ))}
            </div>

            <div className={styles["panel"]}>
                {activeOverviewTab === Tab.Data && (
                    <>
                        <QueryResult queryResponse={dataResponse!}/>
                    </>
                )}

                {activeOverviewTab === Tab.SQL && <QueryTab project={project}/>}

                {activeOverviewTab !== Tab.Data && activeOverviewTab !== Tab.SQL && (
                    <div className={styles["placeholder"]}>
                        {Tab[activeOverviewTab]} (placeholder)
                    </div>
                )}
            </div>
        </div>
    );
};
