import {createContext, type FC, type ReactNode, useContext, useState} from "react";

interface IDbBrowserContext {
    getProjectIdFromUri: () => string;
    openTable: string;
    setOpenTable: (v: string) => void;
}

const DbBrowserContext = createContext<IDbBrowserContext | undefined>(undefined);

export const DbBrowserContextProvider: FC<{ children: ReactNode }> = ({children}) => {
    const [openTable, setOpenTable] = useState<string>('');

    const getProjectIdFromUri = () => {
        return ""
    }

    const dbBrowserContextValue: IDbBrowserContext = {
        openTable,
        setOpenTable,
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
