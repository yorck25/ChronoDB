export interface IRegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    termsAccepted: boolean;
}

export interface ILoginRequest {
    username: string;
    password: string;
}

export interface IUser {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    createdAt: string;
    updatedAt: string;
    active: boolean;
}

export interface IMemberRequest {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    active: boolean;
}

export interface IUsersForProjectResponse {
    firstFiveMembers: string[];
    totalCount: number;
}