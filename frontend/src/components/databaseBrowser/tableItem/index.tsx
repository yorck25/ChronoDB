import type {IColumnStructureResponse, ITableStructureResponse} from "../../../models/database.models.ts";
import {ChevronIcon, TableIcon} from "../../ui/icons";
import styles from './style.module.scss';

export const ColumnItem = ({column}: { column: IColumnStructureResponse }) => (
    <li>
        <p>{column.columnName} <span>{column.dataType}</span></p>
    </li>
);

export const TableItem = ({table, expandedTables, onToggle}: {
    table: ITableStructureResponse,
    expandedTables: Set<string>,
    onToggle: (tableName: string) => void
}) => {
    const isTableExpanded = (tableName: string) => {
        return expandedTables.has(tableName);
    }

    return (
        <li className={`${styles['table-item']} ${
            isTableExpanded(table.tableName) ? styles['expanded'] : 't'
        }`}>
            <div onClick={() => onToggle(table.tableName)} className={styles['table-item-name']}>
                {isTableExpanded(table.tableName) && <div className={styles.marker}/>}

                <div className={styles['icon-container']} id={styles.chevron}>
                    {ChevronIcon()}
                </div>

                <div className={styles['icon-container']}>
                    {TableIcon()}
                </div>

                <p>{table.tableName}</p>
            </div>

            {isTableExpanded(table.tableName) && (
                <ul>
                    {table.columns.map((column: IColumnStructureResponse) => (
                        <ColumnItem key={`${column.columnName}_${column.dataType}`} column={column}/>
                    ))}
                </ul>
            )}
        </li>
    )
}