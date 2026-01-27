import type {IColumnStructureResponse, ITableStructureResponse} from "../../../models/database.models.ts";
import {ChevronIcon, TableIcon} from "../../ui/icons";
import styles from './style.module.scss';
import {ColumnItem} from "../columItem";
import {useDbBrowserContext} from "../../../contexts/dbBrowser.context.tsx";

export const TableItem = ({schemaName, table, expandedTables, onToggle}: {
    schemaName: string,
    table: ITableStructureResponse,
    expandedTables: Set<string>,
    onToggle: (tableName: string) => void
}) => {
    const {setOpenTable, createNewOverviewTab} = useDbBrowserContext();

    const isTableExpanded = (tableName: string) => {
        return expandedTables.has(tableName);
    }

    const handleDoubleClick = () => {
        setOpenTable(table.tableName);
        createNewOverviewTab(schemaName, table.tableName);
    }

    return (
        <li
            className={`${styles['table-item']} ${isTableExpanded(table.tableName) ? styles.expanded : ''}`}
        >
            <div onDblClick={handleDoubleClick} onClick={() => onToggle(table.tableName)}
                 className={styles['table-item-name']}>
                <div className={`${styles.marker} ${isTableExpanded(table.tableName) && styles.visible}`}/>

                <div className={styles['icon-container']} id={styles.chevron}>
                    {ChevronIcon()}
                </div>

                <div className={styles['icon-container']}>
                    {TableIcon()}
                </div>

                <p className={styles.name}>{table.tableName}</p>
            </div>

            {isTableExpanded(table.tableName) && (
                <ul className={styles['schema-list']}>
                    {table.columns.map((column: IColumnStructureResponse) => (
                        <ColumnItem key={`${column.columnName}_${column.dataType}`} column={column}/>
                    ))}
                </ul>
            )}
        </li>
    )
}