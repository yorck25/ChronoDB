import styles from "./style.module.scss";
import {Modal} from "../../ui/modal";
import {useEffect} from "react";
import {useMemo, useState} from "preact/hooks";
import type {ISchemaCommitResponse} from "../../../models/database.models.ts";
import {useLocation, useNavigate} from "react-router-dom";
import {useProjectContext} from "../../../contexts/projects.context.tsx";
import type {IProject} from "../../../models/projects.models.ts";
import {ArrowLeftIcon, MagnifyingGlasIcon} from "../../ui/icons";
import {Button, ButtonType} from "../../ui/button";
import {Input} from "../../ui/input";

interface IProps {
    isOpen: boolean;
    setIsOpen: (s: boolean) => void;
    project: IProject;
}

const COMMIT_PARAM = "commit";
const HISTORY_PARAM = "history";

export const CommitModal = (props: IProps) => {
    const LIMIT = 10;

    const navigate = useNavigate();
    const location = useLocation();
    const {fetchProjectsCommits} = useProjectContext();

    const sp = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const selectedCommitFromUrl = sp.get(COMMIT_PARAM);

    // open if history=1 OR commit exists
    const shouldBeOpenFromUrl = sp.get(HISTORY_PARAM) === "1" || !!selectedCommitFromUrl;

    const [offset, setOffset] = useState<number>(0);
    const [commits, setCommits] = useState<ISchemaCommitResponse | undefined>();
    const [searchInput, setSearchInput] = useState<string>("");

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

    // sync external open-state from URL
    useEffect(() => {
        props.setIsOpen(shouldBeOpenFromUrl);

        if (!shouldBeOpenFromUrl) {
            setOffset(0);
            setCommits(undefined);
            setSearchInput("");
        }
    }, [shouldBeOpenFromUrl]);

    const handleLoadMore = () => setOffset((prev) => prev + LIMIT);

    useEffect(() => {
        if (!props.isOpen) return;

        fetchProjectsCommits(props.project.id, offset, LIMIT).then((r) => {
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
    }, [props.isOpen, props.project.id, offset]);

    useEffect(() => {
        if (!props.isOpen) return;
        setOffset(0);
        setCommits(undefined);
    }, [props.isOpen, props.project.id]);

    const openCommit = (commitId: string) => setCommitInUrl(commitId);
    const closeCommit = () => setCommitInUrl(null);

    const selectedCommit = commits?.commits.find((c) => {
        if (!selectedCommitFromUrl) return;

        return c.id === Number(selectedCommitFromUrl);
    });

    return (
        <Modal
            title="Commit History"
            hint="Every great database has a past. This is yours."
            content={
                <>
                    {!selectedCommitFromUrl ? (
                        <div className={styles.commitHistory}>
                            <div className={styles.toolbar}>
                                <div className={styles.toolbarLeft}>
                                    <div className={styles.metaPill}>
                                        <span className={styles.metaLabel}>Total</span>
                                        <span className={styles.metaValue}>{
                                            commits?.totalCount ?? commits?.commits?.length ?? 0
                                        }</span>
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
                                            className={`${styles['commit-card']} ${isSelected ? styles.commitSelected : undefined}`}
                                            onClick={() => commitId && openCommit(commitId)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if ((e.key === "Enter" || e.key === " ") && commitId)
                                                    openCommit(commitId);
                                            }}
                                        >
                                            <div className={styles.rowFirst}>
                                                <p>{c.id}</p>
                                                <p>{c.title}</p>
                                            </div>
                                            <div className={styles.rowSecond}>
                                                <p>{c.checksum}</p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className={styles.footerBar}>
                                <Button text="Load more" callback={handleLoadMore}/>
                            </div>
                        </div>
                    ) : (
                        <div className={styles.selectedCommitContainer}>
                            <div className={styles['commit-detail-header']}>
                                <Button
                                    callback={closeCommit}
                                    icon={ArrowLeftIcon()}
                                    type={ButtonType.Icon}
                                />

                                {selectedCommit && (
                                    <p>
                                        Selected commit: <strong>{selectedCommitFromUrl}</strong>
                                    </p>
                                )}
                            </div>

                            <div>
                                {selectedCommit && (
                                    <>
                                        <div>
                                            <p>Up Script</p>
                                            <code>
                                                {selectedCommit.upScript}
                                            </code>
                                        </div>

                                        <div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </>
            }
            footerType="single"
            isOpen={props.isOpen}
            cancelButtonText="Close"
            onCancel={() => setHistoryInUrl(false)}
            onClose={() => setHistoryInUrl(false)}
        />
    );
};
