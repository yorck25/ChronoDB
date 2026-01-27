import {useState} from "preact/hooks";
import type {IProject} from "../../../../models/projects.models.ts";
import {useDatabaseWorkerContext} from "../../../../contexts/databaseWorker.context.tsx";
import {Button, ButtonType} from "../../../ui/button";
import {PlayIcon} from "../../../ui/icons";
import {Textarea} from "../../../ui/textarea";
import styles from "./style.module.scss";
import type {IDatabaseQueryResult} from "../../../../models/database.models.ts";
import {QueryResult} from "../queryResult";

interface IQueryTabProps {
    project: IProject;
}

export const QueryTab = ({project}: IQueryTabProps) => {
    const {executeQuery} = useDatabaseWorkerContext();

    const [query, setQuery] = useState<string>("");
    const [queryResponse, setQueryResponse] = useState<IDatabaseQueryResult | undefined>(undefined);

    const sendQuery = () => {
        if (query.trim() === '') {
            return;
        }

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

    return (
        <div className={styles['query-tab']}>
            <div className={styles['options-header']}>
                <div className={styles['button-wrapper']}>
                    <Button id={'send'} callback={() => sendQuery()} icon={PlayIcon()} type={ButtonType.Icon}/>
                </div>
            </div>

            <div onKeyDown={handleKeyDown} className={styles['query-input-section']}>
                <form onSubmit={sendQuery}>
                    <Textarea placeholder={'Enter Query...'} id={'query-input'} value={query}
                              handleInput={handleInput}/>
                </form>
            </div>

            {queryResponse && (
                <QueryResult queryResponse={queryResponse} />
            )}
        </div>
    )
}