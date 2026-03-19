import styles from "./style.module.scss";
import type {IProject} from "../../../models/projects.models.ts";
import {Button, ButtonType} from "../../ui/button";
import {ReloadIcon, TimelineIcon} from "../../ui/icons";
import {useDbBrowserContext} from "../../../contexts/dbBrowser.context.tsx";
import {useEffect, useMemo, useState} from "preact/hooks";
import {CommitModal} from "../commitModal";
import {useLocation, useNavigate} from "react-router-dom";

const HISTORY_PARAM = "history";
const COMMIT_PARAM = "commit";

interface IHeaderProps {
    project: IProject | undefined;
}

export const Header = ({project}: IHeaderProps) => {
    const {createNewQueryTab} = useDbBrowserContext();

    const navigate = useNavigate();
    const location = useLocation();

    const sp = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const isOpenFromUrl = sp.get(HISTORY_PARAM) === "1" || sp.has(COMMIT_PARAM);

    const [isHistoryPopupOpen, setHistoryPopupOpen] = useState<boolean>(isOpenFromUrl);

    useEffect(() => {
        setHistoryPopupOpen(isOpenFromUrl);
    }, [isOpenFromUrl]);

    const updateSearchParams = (mutate: (next: URLSearchParams) => void) => {
        const next = new URLSearchParams(location.search);
        mutate(next);
        const qs = next.toString();
        navigate(
            {pathname: location.pathname, search: qs ? `?${qs}` : ""},
            {replace: false}
        );
    };

    const openHistory = () => {
        updateSearchParams((next) => next.set(HISTORY_PARAM, "1"));
    };

    const handleCreateQuery = () => createNewQueryTab();

    return (
        <div className={styles["database-browser-header"]}>
            {project && (
                <CommitModal
                    isOpen={isHistoryPopupOpen}
                    setIsOpen={setHistoryPopupOpen}
                    project={project}
                />
            )}

            <div className={styles["database-path"]}>
                {project && (
                    <>
                        <p className={styles["project-name"]}>{project.name}</p>
                        <p className={styles["path-divider"]}>/</p>
                        <p>PostgresSQL</p>
                        <p className={styles["path-divider"]}>/</p>
                        <p>postgres</p>
                    </>
                )}
            </div>

            <div className={styles["control-buttons"]}>
                <Button text="Refresh" icon={ReloadIcon()} type={ButtonType.Outline}/>
                <Button callback={handleCreateQuery} text="New Query" type={ButtonType.Outline}/>
                <Button
                    callback={openHistory}
                    text="History"
                    icon={TimelineIcon()}
                    type={ButtonType.Outline}
                />
            </div>
        </div>
    );
};
