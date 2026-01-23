import {type IDBBrowserQueryTab, useDbBrowserContext} from "../../../../contexts/dbBrowser.context.tsx";
import styles from './style.module.scss';
import {Button, ButtonType} from "../../../ui/button";
import {CloseIcon} from "../../../ui/icons";
import React, {useEffect, useState} from "react";

export const DetailTabBar = () => {
    const {browserQueryTabs} = useDbBrowserContext();
    const [activeTab, setActiveTab] = useState<number | undefined>(browserQueryTabs.length ? 0 : undefined);

    useEffect(() => {
        if (browserQueryTabs.length === 0) {
            setActiveTab(undefined);
            return;
        }

        setActiveTab(prev => {
            if (prev == null) return 0;
            return Math.min(prev, browserQueryTabs.length - 1);
        });
    }, [browserQueryTabs.length]);

    return (
        <div className={styles['tab-bar']}>
            <ul className={styles['tab-bar-list']}>
                {browserQueryTabs.map((btq, index) => (
                    <BrowserTabItem
                        key={btq.id}
                        index={index}
                        browserQueryTab={btq}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />
                ))}
            </ul>
        </div>
    );
};

interface IBrowserTabItemProps {
    index: number;
    browserQueryTab: IDBBrowserQueryTab;
    activeTab: number | undefined;
    setActiveTab: React.Dispatch<React.SetStateAction<number | undefined>>;
}

const BrowserTabItem = ({index, browserQueryTab, activeTab, setActiveTab}: IBrowserTabItemProps) => {
    const {browserQueryTabs, setBrowserQueryTabs} = useDbBrowserContext();

    const closeTab = (e: MouseEvent) => {
        e.stopPropagation();

        const closingIndex = browserQueryTabs.findIndex(t => t.id === browserQueryTab.id);
        const nextTabs = browserQueryTabs.filter(t => t.id !== browserQueryTab.id);

        setBrowserQueryTabs(nextTabs);

        setActiveTab((prev) => {
            if (nextTabs.length === 0) return undefined;
            if (prev == null) return 0;

            if (closingIndex === -1) return Math.min(prev, nextTabs.length - 1);

            if (prev > closingIndex) return prev - 1;
            if (prev === closingIndex) return Math.min(closingIndex, nextTabs.length - 1);
            return prev;
        });
    };

    return (
        <li
            className={`${styles['tab-item']} ${activeTab === index ? styles.active : ''}`}
            onClick={() => setActiveTab(index)}
        >
            <p className={styles['tab-name']}>{browserQueryTab.name}</p>

            <div className={styles['close-button-wrapper']}>
                <Button
                    callback={(e) => closeTab(e as MouseEvent)}
                    icon={CloseIcon()}
                    type={ButtonType.Icon}
                />
            </div>
        </li>
    );
};
