import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Header} from "../../components/databaseBrowser/header";
import {useProjectContext} from "../../contexts/projects.context.tsx";
import type {IProjectWithUsers} from "../../models/projects.models.ts";

// const ColumnItem = ({column}: { column: IColumnStructureResponse }) => (
//     <li>
//         <p>{column.columnName} <span>{column.dataType}</span></p>
//     </li>
// );
//
// const TableItem = ({table, expandedTables, onToggle}: {
//     table: ITableStructureResponse,
//     expandedTables: Set<string>,
//     onToggle: (tableName: string) => void
// }) => (
//     <li>
//         <p onClick={() => onToggle(table.tableName)}>{table.tableName}</p>
//         {expandedTables.has(table.tableName) && (
//             <ul>
//                 {table.columns.map((column: IColumnStructureResponse) => (
//                     <ColumnItem key={`${column.columnName}_${column.dataType}`} column={column}/>
//                 ))}
//             </ul>
//         )}
//     </li>
// );
//
// const SchemaItem = ({schema, expandedSchemas, expandedTables, onSchemaToggle, onTableToggle}: {
//     schema: ISchemaStructureResponse,
//     expandedSchemas: Set<string>,
//     expandedTables: Set<string>,
//     onSchemaToggle: (schemaName: string) => void,
//     onTableToggle: (tableName: string) => void
// }) => (
//     <li>
//         <p onClick={() => onSchemaToggle(schema.schemaName)}>{schema.schemaName}</p>
//         {expandedSchemas.has(schema.schemaName) && (
//             <ul>
//                 {schema.tables.map(table => (
//                     <TableItem
//                         key={table.tableName}
//                         table={table}
//                         expandedTables={expandedTables}
//                         onToggle={onTableToggle}
//                     />
//                 ))}
//             </ul>
//         )}
//     </li>
// );

export const DatabaseBrowser = () => {
    // const {fetchDatabaseStructure} = useDatabaseWorkerContext();
    const {getProjectById, fetchProjectById} = useProjectContext();
    const {projectId} = useParams();

    const [project, setProject] = useState<IProjectWithUsers | undefined>();

    // const [loading, setLoading] = useState(false);
    // const [databaseStructure, setDatabaseStructure] = useState<IDatabaseStructureResponse>();
    // const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set());
    // const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
    //
    // useEffect(() => {
    //     setLoading(true);
    //     fetchDatabaseStructure(Number(projectId)).then(structure => {
    //         if (structure) {
    //             setDatabaseStructure(structure);
    //         } else {
    //             console.log("Failed to fetch database structure");
    //         }
    //         setLoading(false);
    //     });
    // }, [projectId]);
    //
    // const handleSchemaToggle = (schemaName: string) => {
    //     setExpandedSchemas(prev => {
    //         const newSet = new Set(prev);
    //         newSet.has(schemaName) ? newSet.delete(schemaName) : newSet.add(schemaName);
    //         return newSet;
    //     });
    // };
    //
    // const handleTableToggle = (tableName: string) => {
    //     setExpandedTables(prev => {
    //         const newSet = new Set(prev);
    //         newSet.has(tableName) ? newSet.delete(tableName) : newSet.add(tableName);
    //         return newSet;
    //     });
    // };

    // if (loading) return <p>Loading database structure...</p>;
    //
    // if (!databaseStructure && !loading) return <p>No database structure found.</p>;

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
        <div>
            {project ?
                <Header project={project.project}/> :
                <p>Loading…</p>
            }

            <div>

            </div>

            {/*<h1>Database Structure</h1>*/}
            {/*<ul>*/}
            {/*    {databaseStructure?.schemas.map(schema => (*/}
            {/*        <SchemaItem*/}
            {/*            key={schema.schemaName}*/}
            {/*            schema={schema}*/}
            {/*            expandedSchemas={expandedSchemas}*/}
            {/*            expandedTables={expandedTables}*/}
            {/*            onSchemaToggle={handleSchemaToggle}*/}
            {/*            onTableToggle={handleTableToggle}*/}
            {/*        />*/}
            {/*    ))}*/}
            {/*</ul>*/}
        </div>
    );
};
