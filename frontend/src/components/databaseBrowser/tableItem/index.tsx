import type {IColumnStructureResponse, ITableStructureResponse} from "../../../models/database.models.ts";

export const ColumnItem = ({column}: { column: IColumnStructureResponse }) => (
    <li>
        <p>{column.columnName} <span>{column.dataType}</span></p>
    </li>
);

export const TableItem = ({table, expandedTables, onToggle}: {
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