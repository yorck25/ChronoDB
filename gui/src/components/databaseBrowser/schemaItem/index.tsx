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
}) => {
    const isSchemaOpen = (schemaName: string) => {
        return expandedSchemas.has(schemaName);
    }

    return (
        <li className={`${styles['schema-item']} ${
            isSchemaOpen(schema.schemaName) ? styles.expanded : ''
        }`}>
            <div onClick={() => onSchemaToggle(schema.schemaName)} className={styles['item-name']}>
                <div className={styles.marker}/>

                <div className={styles['icon-container']}>{ChevronIcon()}</div>

                <p className={styles.name}>{schema.schemaName}</p>
            </div>

            {isSchemaOpen(schema.schemaName) && (
                <ul className={styles['table-item-list']}>
                    {schema.tables.map(table => (
                        <TableItem
                            schemaName={schema.schemaName}
                            key={table.tableName}
                            table={table}
                            expandedTables={expandedTables}
                            onToggle={onTableToggle}
                        />
                    ))}
                </ul>
            )}
        </li>

    )
}