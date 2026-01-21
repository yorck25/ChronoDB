import type {IColumnStructureResponse, ITableStructureResponse} from "../../../models/database.models.ts";
import {ChevronIcon, TableIcon} from "../../ui/icons";
import styles from './style.module.scss';
import {ColumnItem} from "../columItem";

export const TableItem = ({table, expandedTables, onToggle}: {
    table: ITableStructureResponse,
    expandedTables: Set<string>,
    onToggle: (tableName: string) => void
}) => {
    const isTableExpanded = (tableName: string) => {
        return expandedTables.has(tableName);
    }

    return (
        <li
            className={`${styles['table-item']} ${isTableExpanded(table.tableName) ? styles.expanded : ''}`}
        >
            <div onClick={() => onToggle(table.tableName)} className={styles['table-item-name']}>
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