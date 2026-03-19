import {type IDBBrowserTab, useDbBrowserContext} from "../../../../contexts/dbBrowser.context.tsx";
import styles from './style.module.scss';
import {Button, ButtonType} from "../../../ui/button";
import {CloseIcon} from "../../../ui/icons";
import React from "react";

interface IBrowserTabBarProps {
}

export const DetailTabBar = ({}: IBrowserTabBarProps) => {
    const {browserTabs, setActiveTab} = useDbBrowserContext();

    return (
        <div className={styles['tab-bar']}>
            <ul className={styles['tab-bar-list']}>
                {browserTabs.map(bt => (
                    <BrowserTabItem
                        key={bt.id}
                        browserTab={bt}
                        setActiveTab={setActiveTab}
                    />
                ))}
            </ul>
        </div>
    );
};

interface IBrowserTabItemProps {
    browserTab: IDBBrowserTab;
    setActiveTab: React.Dispatch<React.SetStateAction<number | undefined>>;
}

const BrowserTabItem = ({browserTab}: IBrowserTabItemProps) => {
    const {browserTabs, setBrowserTabs, activeTab, setActiveTab} = useDbBrowserContext();

    const closeTab = (e: MouseEvent) => {
        e.stopPropagation();

        const closingIndex = browserTabs.findIndex(t => t.id === browserTab.id);
        const nextTabs = browserTabs.filter(t => t.id !== browserTab.id);

        setBrowserTabs(nextTabs);

        setActiveTab((prev) => {
            if (nextTabs.length === 0) return undefined;
            if (prev == null) return 0;

            if (closingIndex === -1) return Math.min(prev, nextTabs.length - 1);

            if (prev > closingIndex) return prev - 1;
            if (prev === closingIndex) return Math.min(closingIndex, nextTabs.length - 1);
            return prev;
        });
    };

    const handleMouseDown = (e: MouseEvent) => {
        if (e.type === 'mousedown') {
            e.preventDefault();
            closeTab(e)
        }
    }

    return (
        <li
            className={`${styles['tab-item']} ${activeTab === browserTab.id ? styles.active : ''}`}
            onClick={() => setActiveTab(browserTab.id)}
            onDblClick={(e) => handleMouseDown(e)}
        >
            <p className={styles['tab-name']}>{browserTab.name}</p>

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
