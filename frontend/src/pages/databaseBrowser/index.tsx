import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Header} from "../../components/databaseBrowser/header";
import {useProjectContext} from "../../contexts/projects.context.tsx";
import type {IProjectWithUsers} from "../../models/projects.models.ts";
import {DatabaseStructure} from "../../components/databaseBrowser/databaseStructure";
import type {
    IColumnStructureResponse,
    ISchemaStructureResponse,
    ITableStructureResponse
} from "../../models/database.models.ts";
import styles from './style.module.scss';

export const ColumnItem = ({column}: { column: IColumnStructureResponse }) => (
    <li>
        <p>{column.columnName} <span>{column.dataType}</span></p>
    </li>
);

const TableItem = ({table, expandedTables, onToggle}: {
    table: ITableStructureResponse,
    expandedTables: Set<string>,
    onToggle: (tableName: string) => void
}) => (
    <li>
        <p onClick={() => onToggle(table.tableName)}>{table.tableName}</p>
        {expandedTables.has(table.tableName) && (
            <ul>
                {table.columns.map((column: IColumnStructureResponse) => (
                    <ColumnItem key={`${column.columnName}_${column.dataType}`} column={column}/>
                ))}
            </ul>
        )}
    </li>
);

export const SchemaItem = ({schema, expandedSchemas, expandedTables, onSchemaToggle, onTableToggle}: {
    schema: ISchemaStructureResponse,
    expandedSchemas: Set<string>,
    expandedTables: Set<string>,
    onSchemaToggle: (schemaName: string) => void,
    onTableToggle: (tableName: string) => void
}) => (
    <li>
        <p onClick={() => onSchemaToggle(schema.schemaName)}>{schema.schemaName}</p>
        {expandedSchemas.has(schema.schemaName) && (
            <ul>
                {schema.tables.map(table => (
                    <TableItem
                        key={table.tableName}
                        table={table}
                        expandedTables={expandedTables}
                        onToggle={onTableToggle}
                    />
                ))}
            </ul>
        )}
    </li>
);

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
