import styles from './style.module.scss';
import type {IDatabaseQueryResult} from "../../../../models/database.models.ts";

interface IQueryResultProps {
    queryResponse: IDatabaseQueryResult;
}

export const QueryResult = ({queryResponse}: IQueryResultProps) => {
    const getColumns = (qr: any) => {
        if (!qr || !Array.isArray(qr) || qr.length === 0) {
            return []
        }

        const cols: string[] = [];

        for (const [key] of Object.entries(qr[0])) {
            cols.push(key);
        }

        return cols.sort();
    }

    const formatCellValue = (value: unknown): string => {
        if (value == null) return "";

        if (typeof value === "boolean") return value ? "true" : "false";
        if (typeof value === "number") return String(value);
        if (typeof value === "string") return value;

        if (value instanceof Date) return value.toISOString();

        if (Array.isArray(value)) {
            return value.map(v => formatCellValue(v)).join(", ");
        }

        if (typeof value === "object") return JSON.stringify(value);

        return String(value);
    };

    const rows = Array.isArray(queryResponse?.rows) ? queryResponse?.rows : [];
    const columns = getColumns(queryResponse?.rows);


    return (
        <div className={styles['query-response-section']}>
            <p className={styles['query-tab-result-headline']}>Query Result</p>

            <div className={styles['info-container']}>
                {queryResponse?.rowsAffected && (
                    <p>Rows affected {queryResponse.rowsAffected}</p>
                )}
                {queryResponse?.message && (
                    <p>{queryResponse.message}</p>
                )}
            </div>

            <table>
                <thead>
                <tr>
                    {columns.map((c) => (
                        <th key={c}>{c}</th>
                    ))}
                </tr>
                </thead>

                <tbody>
                {rows.map((row, rowIndex) => (
                    <tr key={row?.id + rowIndex}>
                        {columns.map((col) => (
                            <td key={`${rowIndex}-${col}`}>
                                {formatCellValue(row?.[col])}
                            </td>
                        ))}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    )
}

