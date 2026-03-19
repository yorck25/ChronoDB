import {createContext, useContext, useEffect, useState, type Dispatch, type FC, type ReactNode} from 'react';
import type {IConnectionType} from "../models/connection.models.ts";
import {NetworkAdapter, setAuthHeader} from "../lib/networkAdapter.tsx";
import {BASE_API_URL} from "../lib/variables.ts";

const API_BASE_URL = `${BASE_API_URL}/config`;

interface IConfigContext {
    connectionTypes: IConnectionType[] | undefined;
    setConnectionTypes: Dispatch<IConnectionType[] | undefined>;

    getConnectionTypeById: (id: number) => IConnectionType | undefined;
}

const ConfigContext = createContext<IConfigContext | undefined>(undefined);

export const ConfigContextProvider: FC<{ children: ReactNode }> = ({children}) => {
    const [connectionTypes, setConnectionTypes] = useState<IConnectionType[]>();

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = () => {
        const header = setAuthHeader();
        header.append("Content-Type", "application/json");

        const requestOptions: RequestInit = {
            method: NetworkAdapter.GET,
            headers: header,
        }

        fetch(`${API_BASE_URL}/connection-types`, requestOptions)
            .then(res => res.json())
            .then((data: IConnectionType[]) => {
                setConnectionTypes(data);
            });
    }

    const getConnectionTypeById = (id: number): IConnectionType | undefined => {
        return connectionTypes?.find(ct => ct.id === id);
    }

    const contextValue: IConfigContext = {
        connectionTypes,
        setConnectionTypes,
        getConnectionTypeById,
    };

    return (
        <ConfigContext.Provider value={contextValue}>
            {children}
        </ConfigContext.Provider>
    );
};

export default ConfigContext;

export const useConfigContext = () => {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useItemContext must be used within a ItemContextProvider');
    }
    return context;
};