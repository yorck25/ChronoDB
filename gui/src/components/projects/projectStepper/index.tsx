import type {IMemberRequest} from "../../../models/user.models.ts";
import React from "react";
import {CreateProjectForm} from "../createProjectForm";
import {CreateProjectCredentialsForm} from "../createProjectCredentailsForm";
import {AddMembersForm} from "../addMembersForm";
import type {ICreateProjectCredentialsData, ICreateProjectFormData} from "../../../pages/projects";

export interface IProjectStepperProps {
    step: number;
    members: IMemberRequest[];
    setMembers: React.Dispatch<React.SetStateAction<IMemberRequest[]>>;

    newProjectData: ICreateProjectFormData,
    setNewProjectData: React.Dispatch<React.SetStateAction<ICreateProjectFormData>>;

    newCredentialsData: ICreateProjectCredentialsData,
    setNewCredentialsData: React.Dispatch<React.SetStateAction<ICreateProjectCredentialsData>>;
}

export const ProjectStepper = (props: IProjectStepperProps) => {
    return (
        <>

            {props.step === 0 && (
                <CreateProjectForm
                    newProjectData={props.newProjectData}
                    setNewProjectData={props.setNewProjectData}
                />
            )}

            {props.step == 1 && (
                <CreateProjectCredentialsForm connectionType={props.newProjectData.connectionType}
                                              newCredentialsData={props.newCredentialsData}
                                              setNewCredentialsData={props.setNewCredentialsData}/>
            )}

            {props.step == 2 && (
                <AddMembersForm  members={props.members} setMembers={props.setMembers}/>
            )}
        </>
    )
}