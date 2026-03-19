import type {ICreateProjectCredentialsData} from "../../../pages/projects";
import React, {useEffect} from "react";
import {useConfigContext} from "../../../contexts/configContext.context.tsx";
import type {IConnectionType} from "../../../models/connection.models.ts";
import styles from "./style.module.scss";
import {Input, InputType} from "../../ui/input";
import {type DatabaseAuthData, DatabaseCredentialsForm, type DatabaseTypes,} from "./databaseCredentialsForm";

export const CreateProjectCredentialsForm = ({connectionType, newCredentialsData, setNewCredentialsData}: {
    connectionType: string,
    newCredentialsData: ICreateProjectCredentialsData,
    setNewCredentialsData: React.Dispatch<React.SetStateAction<ICreateProjectCredentialsData>>;
}) => {
    const {getConnectionTypeById} = useConfigContext();

    const connectionTypeObject: IConnectionType | undefined = getConnectionTypeById(Number(connectionType));
    if (!connectionTypeObject) {
        return (
            <div>Connection Type is missing or can't get loaded</div>
        )
    }

    const getDatabaseAuthDataTemplate = () => {
        if (connectionTypeObject.key === "mssql") {
            const template = {
                type: "mssql" as DatabaseTypes,
                host: "",
                port: 1433,
                username: "",
                password: "",
                databaseName: "",
                instance: "",
            }
            return template;
        }

        if (connectionTypeObject.key === "psql") {
            const template = {
                type: "psql" as DatabaseTypes,
                host: "",
                port: 5432,
                username: "",
                password: "",
                databaseName: "",
            }
            return template;
        }

        return {
            type: "psql" as DatabaseTypes,
            host: "",
            port: 5432,
            username: "",
            password: "",
            databaseName: "",
        }
    }

    const [dbAuthData, setDbAuthData] = React.useState<DatabaseAuthData>(getDatabaseAuthDataTemplate() as DatabaseAuthData);

    useEffect(() => {
        setNewCredentialsData(prev => ({
            ...prev,
            databaseAuth: dbAuthData
        }));
    }, [dbAuthData]);

    const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const {id, value} = target;

        setNewCredentialsData((prev: any) => ({
            ...prev,
            [id]: value,
        }));
    }

    return (
        <div className={styles.create_project_credentials_form_groups}>
            <form className={styles.create_project_form}>
                <div className={styles.form_row}>
                    <Input
                        id={"projectPassword"}
                        handleInput={handleInput}
                        value={newCredentialsData.projectPassword}
                        label={"Project Password"}
                        inputType={InputType.PASSWORD}
                    />
                </div>
            </form>


            <div className={styles.db_credentials_form_wrapper}>
                <DatabaseCredentialsForm databaseAuthData={dbAuthData} setDatabaseAuthData={setDbAuthData}/>
            </div>
        </div>
    )
}