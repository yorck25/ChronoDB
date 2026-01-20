import type {ISchemaStructureResponse} from "../../../models/database.models.ts";
import styles from "./style.module.scss";
import {ChevronIcon} from "../../ui/icons";
import {TableItem} from "../tableItem";

export const SchemaItem = ({schema, expandedSchemas, expandedTables, onSchemaToggle, onTableToggle}: {
    schema: ISchemaStructureResponse,
    expandedSchemas: Set<string>,
    expandedTables: Set<string>,
    onSchemaToggle: (schemaName: string) => void,
    onTableToggle: (tableName: string) => void
}) => (
    <li>
        <div className={styles.marker} />

        {ChevronIcon()}

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