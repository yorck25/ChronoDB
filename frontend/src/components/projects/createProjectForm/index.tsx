import styles from "./style.module.scss";
import {ProjectVisibilityType} from "../../../enums/projects.enum.ts";
import {useConfigContext} from "../../../contexts/configContext.context.tsx";
import type {IConnectionType} from "../../../models/connection.models.ts";
import type {ICreateProjectFormData} from "../../../pages/projects";
import React from "react";
import {Select} from "../../ui/select";
import {Textarea} from "../../ui/textarea";
import {Input} from "../../ui/input";

export const CreateProjectForm = ({newProjectData, setNewProjectData}: {
    newProjectData: ICreateProjectFormData,
    setNewProjectData: React.Dispatch<React.SetStateAction<ICreateProjectFormData>>;
}) => {
    const {connectionTypes} = useConfigContext();

    const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const {id, value} = target;

        setNewProjectData((prev: any) => ({
            ...prev,
            [id]: value,
        }));
    }

    const getConnectionOptions = () => {
        return (connectionTypes ? connectionTypes : []).map((type: IConnectionType) => {
            return {value: type.id.toString(), label: type.key}
        });
    }

    const getVisibilityOptions = () => {
        return [{
            value: ProjectVisibilityType.PUBLIC,
            label: "Public"
        }, {
            value: ProjectVisibilityType.PRIVATE,
            label: "Private"
        }]
    }

    return (
        <form className={styles.create_project_form}>
            <div className={styles.form_row}>
                <Input
                    id={"projectName"}
                    handleInput={handleInput}
                    value={newProjectData.projectName}
                    label={"Project Name"}
                />
            </div>

            <div className={styles.single_form_row}>
                <Textarea
                    id={"description"}
                    handleInput={handleInput}
                    value={newProjectData.description}
                    label={"Description"}
                />
            </div>

            <div className={styles.form_row}>
                <Select
                    id="visibility"
                    label="Visibility"
                    value={newProjectData.visibility}
                    placeholder="Select a visibility"
                    handleChange={getVisibilityOptions}
                    options={getVisibilityOptions()}
                    errorMessage={!newProjectData.visibility ? "Please select a visibility" : ""}
                />

                <Select
                    id="connectionType"
                    label="Connection Type"
                    value={newProjectData.connectionType}
                    placeholder="Select a connection type"
                    handleChange={handleInput}
                    options={getConnectionOptions()}
                    errorMessage={!newProjectData.visibility ? "Please select a visibility" : ""}
                />
            </div>
        </form>
    )
}