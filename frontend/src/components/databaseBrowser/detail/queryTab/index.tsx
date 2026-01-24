import {useState} from "preact/hooks";
import type {IProject} from "../../../../models/projects.models.ts";
import {useDatabaseWorkerContext} from "../../../../contexts/databaseWorker.context.tsx";
import {Button, ButtonType} from "../../../ui/button";
import {PlayIcon} from "../../../ui/icons";
import {Textarea} from "../../../ui/textarea";
import styles from "./style.module.scss";

interface IQueryTabProps {
    project: IProject;
}

export const QueryTab = ({project}: IQueryTabProps) => {
    const {executeQuery} = useDatabaseWorkerContext();

    const [query, setQuery] = useState<string>("INSERT INTO products (id, name, created_at, deleted) VALUES (4, 'pen', now(), false);");
    const [queryResponse, setQueryResponse] = useState<any>(undefined);

    const sendQuery = () => {
        executeQuery(project.id, query).then((r) => {
            setQueryResponse(r);
        })
    }

    const handleInput = (e: Event) => {
        const input = (e.target as HTMLInputElement)?.value;
        setQuery(input);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'enter') {
            sendQuery();
        }
    }

    const getColumns = (qr: any) => {
        if (!qr) {
            return [];
        }

        if (!Array.isArray(qr) || qr.length === 0) {
            return []
        }

        console.log(qr)

        const cols: string[] = [];

        for (const [key, value] of Object.entries(qr[0])) {
            console.log(`${key}: ${value}`);
            cols.push(key);
        }

        cols.sort();

        return cols;
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

    const rows = Array.isArray(queryResponse) ? queryResponse : [];
    const columns = getColumns(rows);

    return (
        <div className={styles['query-tab']}>
            <div className={styles['options-header']}>
                <div className={styles['button-wrapper']}>
                    <Button id={'send'} callback={() => sendQuery()} icon={PlayIcon()} type={ButtonType.Icon}/>
                </div>
            </div>

            <div onKeyDown={handleKeyDown} className={styles['query-input-section']}>
                <form onSubmit={sendQuery}>
                    <Textarea id={'query-input'} value={query} handleInput={handleInput}/>
                </form>
            </div>

            <div className={styles['query-response-section']}>
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
                        <tr key={row?.id ?? rowIndex}>
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
        </div>
    )
}