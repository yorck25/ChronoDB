import React, {createContext, type FC, type ReactNode, useContext, useState} from "react";

interface IDbBrowserContext {
    getProjectIdFromUri: () => string;
    openTable: string;
    browserTabs: IDBBrowserTab[];
    setBrowserTabs: (tabs: IDBBrowserTab[]) => void;
    setOpenTable: (v: string) => void;
    activeTab: number | undefined;
    setActiveTab: React.Dispatch<React.SetStateAction<number | undefined>>;
    getActiveTabFromId: () => IDBBrowserTab | undefined;
    createNewQueryTab: (schemaName?: string, tableName?: string) => void;
}

export enum BrowserTabType {
    QUERY = 'query',
    OVERVIEW = 'overview'
}

export interface IDBBrowserTab {
    id: number;
    name: string;
    type: BrowserTabType;
    schemaName: string;
    tableName: string;
    createdAt: Date;
}

const DbBrowserContext = createContext<IDbBrowserContext | undefined>(undefined);

export const DbBrowserContextProvider: FC<{ children: ReactNode }> = ({children}) => {
    const [browserTabs, setBrowserTabs] = useState<IDBBrowserTab[]>([]);
    const [openTable, setOpenTable] = useState<string>('');
    const [activeTab, setActiveTab] = useState<number | undefined>(undefined);

    const createNewQueryTab = (schemaName?: string, tableName?: string) => {
        const id = Math.floor(Math.random() * 990) + 10;

        const newQueryTab: IDBBrowserTab = {
            id: id,
            name: 'Query ' + id.toString(),
            type: BrowserTabType.QUERY,
            schemaName: schemaName ?? '',
            tableName: tableName ?? '',
            createdAt: new Date()
        }

        setBrowserTabs((prev) => [...prev, newQueryTab]);
        setActiveTab(id);
    }

    const getProjectIdFromUri = () => {
        return ""
    }

    const getActiveTabFromId = () => {
        return browserTabs.find(tab => tab.id === activeTab);
    }

    const dbBrowserContextValue: IDbBrowserContext = {
        openTable,
        setOpenTable,
        browserTabs,
        setBrowserTabs,
        activeTab,
        setActiveTab,
        getProjectIdFromUri,
        getActiveTabFromId,
        createNewQueryTab
    }

    return (
        <DbBrowserContext.Provider value={dbBrowserContextValue}>
            {children}
        </DbBrowserContext.Provider>
    )
}

export default DbBrowserContext;


export const useDbBrowserContext = () => {
    const context = useContext(DbBrowserContext);
    if (!context) {
        throw new Error("useDbBrowserContext must be used within a DbBrowserContext");
    }
    return context;
};
