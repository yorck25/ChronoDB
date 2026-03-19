import type {DatabaseAuthData} from "../components/projects/createProjectCredentailsForm/databaseCredentialsForm";
import type {IUsersForProjectResponse} from "./user.models.ts";

export interface ICreateProjectRequest {
    metadata: ICreateProjectMetadataRequest;
    credentials: ICreateProjectCredentialsRequest;
    members: ICreateProjectMembersRequest;
}

export interface ICreateProjectMetadataRequest {
    name: string;
    description: string;
    visibility: string;
    connectionType: number;
}

export interface ICreateProjectCredentialsRequest {
    projectPassword: string;
    databaseAuth: DatabaseAuthData;
}

export interface ICreateProjectMembersRequest {
    members: number[];
}

export interface IProject {
    id: number;
    ownerId: number;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    active: boolean;
    visibility: string;
    connectionType: number;
}

export interface IProjectWithUsers {
    project: IProject;
    users: IUsersForProjectResponse;
}