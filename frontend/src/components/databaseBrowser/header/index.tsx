import styles from "./style.module.scss";
import type {IProject} from "../../../models/projects.models.ts";
import {Button, ButtonType} from "../../ui/button";
import {MagnifyingGlasIcon, ReloadIcon, TimelineIcon} from "../../ui/icons";
import {useDbBrowserContext} from "../../../contexts/dbBrowser.context.tsx";
import {useEffect, useMemo, useState} from "preact/hooks";
import {Modal} from "../../ui/modal";
import {useProjectContext} from "../../../contexts/projects.context.tsx";
import type {ISchemaCommitResponse} from "../../../models/database.models.ts";
import {Input} from "../../ui/input";
import {useLocation, useNavigate} from "react-router-dom";

interface IHeaderProps {
    project: IProject | undefined;
}

const HISTORY_PARAM = "history";
const COMMIT_PARAM = "commit";

export const Header = ({project}: IHeaderProps) => {
    const LIMIT = 10;

    const navigate = useNavigate();
    const location = useLocation();

    const {createNewQueryTab} = useDbBrowserContext();
    const {fetchProjectsCommits} = useProjectContext();

    const sp = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const isHistoryOpenFromUrl = sp.get(HISTORY_PARAM) === "1";
    const selectedCommitFromUrl = sp.get(COMMIT_PARAM);

    const [isHistoryPopupOpen, setHistoryPopupOpen] = useState<boolean>(isHistoryOpenFromUrl);
    const [offset, setOffset] = useState<number>(0);
    const [commits, setCommits] = useState<ISchemaCommitResponse | undefined>();
    const [searchInput, setSearchInput] = useState<string>("");

    useEffect(() => {
        setHistoryPopupOpen(isHistoryOpenFromUrl);

        if (!isHistoryOpenFromUrl) {
            setOffset(0);
            setCommits(undefined);
            setSearchInput("");
            if (selectedCommitFromUrl) setCommitInUrl(null);
        }
    }, [isHistoryOpenFromUrl]);

    const updateSearchParams = (mutate: (next: URLSearchParams) => void) => {
        const next = new URLSearchParams(location.search);
        mutate(next);
        const qs = next.toString();
        navigate(
            {pathname: location.pathname, search: qs ? `?${qs}` : ""},
            {replace: false}
        );
    };

    const setHistoryInUrl = (open: boolean) => {
        updateSearchParams((next) => {
            if (open) next.set(HISTORY_PARAM, "1");
            else next.delete(HISTORY_PARAM);

            if (!open) next.delete(COMMIT_PARAM);
        });
    };

    const setCommitInUrl = (commitId: string | null) => {
        updateSearchParams((next) => {
            next.set(HISTORY_PARAM, "1");

            if (commitId) next.set(COMMIT_PARAM, commitId);
            else next.delete(COMMIT_PARAM);
        });
    };

    const toggleHistory = () => setHistoryInUrl(!(sp.get(HISTORY_PARAM) === "1"));

    const handleCreateQuery = () => createNewQueryTab();

    const handleLoadMore = () => setOffset((prev) => prev + LIMIT);

    const handleHistoryPopup = () => {
        toggleHistory();
    };

    useEffect(() => {
        if (!isHistoryPopupOpen || !project) return;

        fetchProjectsCommits(project.id, offset, LIMIT).then((r) => {
            if (!r) return;

            setCommits((prev) => {
                if (!prev || offset === 0) return r;
                return {
                    ...r,
                    commits: [...(prev.commits ?? []), ...(r.commits ?? [])],
                    totalCount: r.totalCount ?? prev.totalCount,
                };
            });
        });
    }, [isHistoryPopupOpen, project?.id, offset]);

    useEffect(() => {
        if (!isHistoryPopupOpen) return;
        setOffset(0);
        setCommits(undefined);
    }, [isHistoryPopupOpen, project?.id]);

    const openCommit = (commitId: string) => {
        setCommitInUrl(commitId);
    };

    const closeCommit = () => {
        setCommitInUrl(null);
    };

    return (
        <div className={styles["database-browser-header"]}>
            {isHistoryPopupOpen && (
                <Modal
                    title="Commit History"
                    hint="Every great database has a past. This is yours."
                    content={
                        <div className={styles.commitHistory}>
                            <div className={styles.toolbar}>
                                <div className={styles.toolbarLeft}>
                                    <div className={styles.metaPill}>
                                        <span className={styles.metaLabel}>Total</span>
                                        <span className={styles.metaValue}>
                      {commits?.totalCount ?? commits?.commits?.length ?? 0}
                    </span>
                                    </div>

                                    <div className={styles.searchWrap}>
                                        <Input
                                            placeholder="Search title, message, script, checksum…"
                                            icon={MagnifyingGlasIcon()}
                                            id="queryCommitInputField"
                                            value={searchInput}
                                            iconPosition="leading"
                                            handleInput={(e) =>
                                                setSearchInput((e.target as HTMLInputElement).value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className={styles.toolbarRight}>
                                    <Button
                                        htmlType="button"
                                        type={ButtonType.Outline}
                                        text="Newest First"
                                        callback={() => {
                                            setOffset(0);
                                            setCommits(undefined);
                                        }}
                                    />
                                </div>
                            </div>

                            <ul className={styles["commit-card-list"]}>
                                {commits?.commits?.map((c) => {
                                    const commitId = String(c.id ?? c.checksum ?? "");
                                    const isSelected = !!commitId && selectedCommitFromUrl === commitId;

                                    return (
                                        <li
                                            key={commitId}
                                            className={isSelected ? styles.commitSelected : undefined}
                                            onClick={() => commitId && openCommit(commitId)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if ((e.key === "Enter" || e.key === " ") && commitId) openCommit(commitId);
                                            }}
                                        >
                                            <div>{c.id}</div>
                                            <div>{c.title}</div>
                                        </li>
                                    );
                                })}
                            </ul>

                            {/* Optional: show selected commit details section when commit param exists */}
                            {selectedCommitFromUrl && (
                                <div className={styles.selectedCommitBar}>
                                    <div className={styles.selectedCommitText}>
                                        Selected commit: <code>{selectedCommitFromUrl}</code>
                                    </div>
                                    <Button
                                        htmlType="button"
                                        type={ButtonType.Outline}
                                        text="Clear"
                                        callback={closeCommit}
                                    />
                                </div>
                            )}

                            <div className={styles.footerBar}>
                                <Button text="Load more" callback={handleLoadMore}/>
                            </div>
                        </div>
                    }
                    footerType="single"
                    isOpen
                    cancelButtonText="Close"
                    onCancel={() => setHistoryInUrl(false)}
                    onClose={() => setHistoryInUrl(false)}
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
                    callback={handleHistoryPopup}
                    text="History"
                    icon={TimelineIcon()}
                    type={ButtonType.Outline}
                />
            </div>
        </div>
    );
};
