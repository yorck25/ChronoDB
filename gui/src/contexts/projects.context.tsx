import {
    createContext,
    useContext,
    useState,
    type Dispatch,
    type FC,
    type ReactNode, useEffect,
} from "react";
import type {ICreateProjectRequest, IProjectWithUsers} from "../models/projects.models";
import {NetworkAdapter, setAuthHeader} from "../lib/networkAdapter.tsx";
import type {DatabaseAuthData} from "../components/projects/createProjectCredentailsForm/databaseCredentialsForm";
import {BASE_API_URL} from "../lib/variables.ts";
import type {ISchemaCommitResponse} from "../models/database.models.ts";

const API_BASE_URL = BASE_API_URL;

interface IProjectContext {
    projects: IProjectWithUsers[] | undefined;
    setProjects: Dispatch<any>;
    getProjectById: (projectId: number) => IProjectWithUsers | undefined;
    ensureProjectLoaded: (projectId: number) => Promise<IProjectWithUsers | undefined>;
    createProject: (cpr: ICreateProjectRequest) => Promise<boolean>;
    testConnection: (authData: DatabaseAuthData) => Promise<boolean>;
    fetchProjectById: (projectId: number) => Promise<IProjectWithUsers | undefined>;
    fetchProjects: () => void;
    fetchProjectsCommits: (projectId: number, offset?: number, limit?: number) => Promise<ISchemaCommitResponse | undefined>;
}

const ProjectContext = createContext<IProjectContext | undefined>(undefined);

export const ProjectContextProvider: FC<{ children: ReactNode }> = ({children}) => {
    const [projects, setProjects] = useState<IProjectWithUsers[]>();

    useEffect(() => {
        //TODO: Improve this
        fetchProjects();
    }, []);

    const fetchProjectsCommits = async (projectId: number, offset?: number, limit?: number) => {
        try {
            const myHeaders = setAuthHeader();
            myHeaders.append("Content-Type", "application/json");
            myHeaders.append("offset", String(offset ?? 0))
            myHeaders.append("limit", String(limit ?? 0))

            const requestOptions: RequestInit = {
                method: NetworkAdapter.GET,
                headers: myHeaders,
            };

            const res = await fetch(`${API_BASE_URL}/projects/${projectId}/commits`, requestOptions);
            if (!res.ok) throw new Error(res.statusText);

            return await res.json();
        } catch (e) {
            console.error("Failed to fetch projects:", e);
        }
    }

    const fetchProjects = async () => {
        try {
            const myHeaders = setAuthHeader();
            myHeaders.append("Content-Type", "application/json");

            const requestOptions: RequestInit = {
                method: NetworkAdapter.GET,
                headers: myHeaders,
            };

            const res = await fetch(`${API_BASE_URL}/projects`, requestOptions);
            if (!res.ok) throw new Error(res.statusText);

            const data: IProjectWithUsers[] = await res.json();
            setProjects(data);
        } catch (e) {
            console.error("Failed to fetch projects:", e);
        }
    };

    const getProjectById = (id: number) => {
        if (!projects || projects.length === 0) return undefined;

        return projects.find((p) => p?.project?.id === id);
    };

    const fetchProjectById = async (projectId: number): Promise<IProjectWithUsers | undefined> => {
        try {
            const myHeaders = setAuthHeader();
            myHeaders.append("Content-Type", "application/json");

            const requestOptions: RequestInit = {
                method: NetworkAdapter.GET,
                headers: myHeaders,
            };

            const res = await fetch(`${API_BASE_URL}/projects/${projectId}`, requestOptions);
            if (!res.ok) throw new Error(res.statusText);

            return await res.json();
        } catch (e) {
            console.error("Failed to fetch project:", e);
            return undefined;
        }
    };

    const ensureProjectLoaded = async (
        projectId: number
    ): Promise<IProjectWithUsers | undefined> => {
        const existing = getProjectById(projectId);
        if (existing) return existing;
        return await fetchProjectById(projectId);
    };

    const createProject = async (cpr: ICreateProjectRequest): Promise<boolean> => {
        try {
            const myHeaders = setAuthHeader();
            myHeaders.append("Content-Type", "application/json");

            const requestOptions: RequestInit = {
                method: NetworkAdapter.POST,
                headers: myHeaders,
                body: JSON.stringify(cpr),
            };

            const res = await fetch(`${API_BASE_URL}/projects`, requestOptions);
            if (!res.ok) throw new Error(res.statusText);

            const data: IProjectWithUsers = await res.json();
            setProjects((prev) => (prev ? [...prev, data] : [data]));
            return true;
        } catch (e) {
            console.error("Failed to create project:", e);
            return false;
        }
    };

    const testConnection = async (authData: DatabaseAuthData): Promise<boolean> => {
        const authObj = {
            databaseAuth: {
                ...authData,
                port: String(authData.port),
            },
        };

        const headers = setAuthHeader();
        headers.append("Content-Type", "application/json");

        const requestOptions: RequestInit = {
            method: NetworkAdapter.POST,
            headers: headers,
            body: JSON.stringify(authObj),
        }

        const res = await fetch(`${API_BASE_URL}/projects/test-connection`, requestOptions);
        return res.ok;
    }

    const appContextValue: IProjectContext = {
        projects,
        setProjects,
        getProjectById,
        ensureProjectLoaded,
        createProject,
        testConnection,
        fetchProjectById,
        fetchProjects,
        fetchProjectsCommits
    };

    return (
        <ProjectContext.Provider value={appContextValue}>
            {children}
        </ProjectContext.Provider>
    );
};

export const useProjectContext = () => {
    const context = useContext(ProjectContext);
    if (!context) throw new Error("useProjectContext must be used within a ProjectContextProvider");
    return context;
};
