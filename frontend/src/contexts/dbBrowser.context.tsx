import {createContext, type FC, type ReactNode, useContext, useEffect, useState} from "react";

interface IDbBrowserContext {
    getProjectIdFromUri: () => string;
    openTable: string;
    browserQueryTabs: IDBBrowserQueryTab[];
    setBrowserQueryTabs: (tabs: IDBBrowserQueryTab[]) => void;
    setOpenTable: (v: string) => void;
}

export interface IDBBrowserQueryTab {
    id: number;
    name: string;
    schemaName: string;
    tableName: string;
    createdAt: Date;
}

const DbBrowserContext = createContext<IDbBrowserContext | undefined>(undefined);

export const DbBrowserContextProvider: FC<{ children: ReactNode }> = ({children}) => {
    const [browserQueryTabs, setBrowserQueryTabs] = useState<IDBBrowserQueryTab[]>([]);
    const [openTable, setOpenTable] = useState<string>('');

    useEffect(() => {
        console.log("fake tabs");

        const dumm1: IDBBrowserQueryTab = {
            id: 21,
            name: "Query 1",
            schemaName: "public",
            tableName: "products",
            createdAt: new Date()
        }

        const dumm2: IDBBrowserQueryTab = {
            id: 22,
            name: "Query 1",
            schemaName: "public",
            tableName: "products",
            createdAt: new Date()
        }

        setBrowserQueryTabs([dumm1, dumm2]);
    }, [])

    const getProjectIdFromUri = () => {
        return ""
    }

    const dbBrowserContextValue: IDbBrowserContext = {
        openTable,
        setOpenTable,
        browserQueryTabs,
        setBrowserQueryTabs,
        getProjectIdFromUri,
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
