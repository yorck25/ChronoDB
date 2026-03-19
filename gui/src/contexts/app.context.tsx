import {
    createContext,
    useContext,
    useEffect,
    useState,
    type Dispatch,
    type FC,
    type ReactNode,
} from "react";
import type {ILoginRequest, IRegisterRequest, IUser} from "../models/user.models.ts";
import {NetworkAdapter, removeTokenFromStorage, saveTokenInStorage, setAuthHeader} from "../lib/networkAdapter.tsx";
import {BASE_API_URL} from "../lib/variables.ts";

const API_BASE_URL = BASE_API_URL;

interface IAppContext {
    user: IUser | undefined;
    setUser: Dispatch<IUser | undefined>;

    isLoggedIn: boolean;
    setIsLoggedIn: Dispatch<boolean>;

    token: string | undefined;
    setToken: Dispatch<string | undefined>;

    registerRequest: (rr: IRegisterRequest) => Promise<boolean>;
    loginRequest: (lr: ILoginRequest) => Promise<boolean>;
    checkUserLogin: () => boolean;
    logout: () => boolean;
}

const AppContext = createContext<IAppContext | undefined>(undefined);

export const AppContextProvider: FC<{ children: ReactNode }> = ({
                                                                    children
                                                                }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<IUser | undefined>();
    const [token, setToken] = useState<string | undefined>();

    useEffect(() => {
        setUserStates();
    }, []);

    const checkUserLogin = (): boolean => {
        if (!isLoggedIn) {
            return setUserStates();
        }
        return true;
    };

    const setUserStates = (): boolean => {
        const storedToken = localStorage.getItem("authToken");
        if (storedToken) {
            setToken(storedToken);
            setIsLoggedIn(true);
            getUser().then(u => {
                if (u) {
                    setUser(u);
                } else {
                    setIsLoggedIn(false);
                    setToken(undefined);
                    localStorage.removeItem("authToken");
                }
            });
            return true;
        } else {
            setIsLoggedIn(false);
            setToken(undefined);
            return false;
        }
    }

    const registerRequest = async (rr: IRegisterRequest): Promise<boolean> => {
        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const requestOptions: RequestInit = {
                method: NetworkAdapter.POST,
                headers: myHeaders,
                redirect: 'follow',
                body: JSON.stringify(rr),
            };

            const response = await fetch(`${API_BASE_URL}/auth/register`, requestOptions);

            if (!response.ok) {
                console.error(new Error("Network response was not ok"));
                return false;
            }

            const result: { token: string, user: IUser } = await response.json();

            setUser(result.user);
            setToken(result.token);
            setIsLoggedIn(true);
            saveTokenInStorage(result.token);

            return true;

        } catch (error) {
            console.error("Fetch error:", error);
            return false;
        }
    };

    const getUser = async (): Promise<IUser | undefined> => {
        try {
            const myHeaders = setAuthHeader();
            myHeaders.append("Content-Type", "application/json");

            const requestOptions: RequestInit = {
                method: NetworkAdapter.GET,
                headers: myHeaders,
                redirect: 'follow',
            }

            const response = await fetch(`${API_BASE_URL}/auth/me`, requestOptions);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const result: IUser = await response.json();
            setUser(result);
            return result;
        } catch (e) {
            console.error("Fetch error:", e);
            return undefined;
        }
    }

    const loginRequest = async (lr: ILoginRequest): Promise<boolean> => {
        try {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const requestOptions: RequestInit = {
                method: NetworkAdapter.POST,
                headers: myHeaders,
                redirect: 'follow',
                body: JSON.stringify(lr),
            };

            const response = await fetch(`${API_BASE_URL}/auth/login`, requestOptions);
            if (!response.ok) {
                console.error(new Error("Network response was not ok"));
                return false;
            }

            const result: { token: string, user: IUser } = await response.json();

            setUser(result.user);
            setToken(result.token);
            setIsLoggedIn(true);
            saveTokenInStorage(result.token);

            return true;

        } catch (error) {
            console.error("Fetch error:", error);
            return false;
        }
    }

    const logout = (): boolean => {
        try {
            setUser(undefined);
            setToken(undefined);
            setIsLoggedIn(false);
            removeTokenFromStorage();
            return true;
        } catch (e) {
            console.error("Logout error:", e);
            return false;
        }
    };

    const appContextValue: IAppContext = {
        user,
        setUser,

        isLoggedIn,
        setIsLoggedIn,

        token,
        setToken,

        registerRequest,
        loginRequest,
        checkUserLogin,
        logout,
    };

    return (
        <AppContext.Provider value={appContextValue}>
            {children}
        </AppContext.Provider>
    );
};

export default AppContext;

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useItemContext must be used within a ItemContextProvider");
    }
    return context;
};
