import {createContext, useContext, useState, type Dispatch, type FC, type ReactNode} from 'react';
import type {IConnectionType} from "../models/connection.models.ts";
import {NetworkAdapter, setAuthHeader} from "../lib/networkAdapter.tsx";
import type {IDatabaseStructureResponse} from "../models/database.models.ts";
import {BASE_API_URL} from "../lib/variables.ts";

const WORKER_API_BASE_URL = `${BASE_API_URL}/database-worker`;

interface IDatabaseWorkerContext {
    DatabaseWorker: IConnectionType[] | undefined;
    setDatabaseWorker: Dispatch<IConnectionType[] | undefined>;

    fetchDatabaseStructure: (projectId: number) => Promise<IDatabaseStructureResponse | undefined>;
    executeQuery: (projectId: number, query: string) => Promise<any | undefined>;
}

const DatabaseWorkerContext = createContext<IDatabaseWorkerContext | undefined>(undefined);

export const DatabaseWorkerContextProvider: FC<{ children: ReactNode }> = ({children}) => {
    const [DatabaseWorker, setDatabaseWorker] = useState<IConnectionType[]>();

    const fetchDatabaseStructure = async (projectId: number): Promise<IDatabaseStructureResponse | undefined> => {
        const header = setAuthHeader();
        header.append("Content-Type", "application/json");

        const requestOptions: RequestInit = {
            method: NetworkAdapter.GET,
            headers: header,
        }

        const res = await fetch(`${WORKER_API_BASE_URL}/db-structure?project_id=${projectId}`, requestOptions);
        if (res.status !== 200) {
            return;
        }

        return res.json();
    }

    const executeQuery = async (projectId: number, query: string) => {
        const header = setAuthHeader();
        header.append("Content-Type", "application/json");

        const requestOptions: RequestInit = {
            method: NetworkAdapter.POST,
            headers: header,
            body: JSON.stringify({
                'query': query
            }),
        }

        const res = await fetch(`${WORKER_API_BASE_URL}/execute-query?project_id=${projectId}`, requestOptions);
        if (res.status !== 200) {
            return;
        }

        return res.json();
    }

    const contextValue: IDatabaseWorkerContext = {
        DatabaseWorker,
        setDatabaseWorker,
        fetchDatabaseStructure,
        executeQuery,
    };

    return (
        <DatabaseWorkerContext.Provider value={contextValue}>
            {children}
        </DatabaseWorkerContext.Provider>
    );
};

export default DatabaseWorkerContext;

export const useDatabaseWorkerContext = () => {
    const context = useContext(DatabaseWorkerContext);
    if (!context) {
        throw new Error('useDatabaseWorkerContext must be used within a DatabaseWorkerProvider');
    }
    return context;
};