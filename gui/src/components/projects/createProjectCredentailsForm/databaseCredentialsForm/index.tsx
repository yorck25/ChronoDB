import React, {useState} from "react";
import styles from "./style.module.scss";
import {useProjectContext} from "../../../../contexts/projects.context.tsx";
import {Input, InputType} from "../../../ui/input";
import {Button, ButtonType} from "../../../ui/button";

export type DatabaseTypes = "psql" | "mssql" | "mysql";

export interface IBaseDatabaseAuth {
    host: string;
    port: number;
    username: string;
    password: string;
    databaseName: string;
}

export interface IPsqlAuthData extends IBaseDatabaseAuth {
    type: "psql";
}

export interface IMssqlAuthData extends IBaseDatabaseAuth {
    type: "mssql";
    instance: string;
}

export type DatabaseAuthData = IPsqlAuthData | IMssqlAuthData;

interface PostgresDatabaseCredentialsProps {
    databaseAuthData: DatabaseAuthData;
    setDatabaseAuthData: React.Dispatch<React.SetStateAction<DatabaseAuthData>>;
}

export const DatabaseCredentialsForm = (props: PostgresDatabaseCredentialsProps) => {
    const {testConnection} = useProjectContext();
    const [connectionState, setConnectionState] = useState<boolean | undefined>(undefined);

    const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const {id, value} = target;

        let newValue = value;

        if (id === "port" && value.length > 5) {
            newValue = value.slice(0, 5);
        }

        props.setDatabaseAuthData((prev) => ({
            ...prev,
            [id]: id === "port" ? Number(newValue) : newValue,
        }));
    }

    const handleTestConnection = () => {
        testConnection(props.databaseAuthData).then((success: boolean) => {
            setConnectionState(success);
        })
    }

    return (
        <form className={styles.database_credentials_form}>
            <div className={styles.form_row}>
                <Input
                    id={"host"}
                    handleInput={handleInput}
                    value={props.databaseAuthData.host}
                    label={"Host"}
                    inputType={InputType.TEXT}
                />

                <Input
                    id={"port"}
                    limit={5}
                    handleInput={handleInput}
                    value={props.databaseAuthData.port}
                    label={"Port"}
                    inputType={InputType.NUMBER}
                />
            </div>

            <div className={styles.form_row}>
                {props.databaseAuthData.type === "mssql" && (
                    <div className={styles.single_form_row}>
                        <Input
                            id="instance"
                            handleInput={handleInput}
                            value={(props.databaseAuthData as IMssqlAuthData).instance ?? ""}
                            label="Instance"
                            inputType={InputType.TEXT}
                        />
                    </div>
                )}
            </div>

            <div className={styles.form_row}>
                <Input
                    id={"username"}
                    handleInput={handleInput}
                    value={props.databaseAuthData.username}
                    label={"Username"}
                    inputType={InputType.TEXT}
                />

                <Input
                    id={"password"}
                    handleInput={handleInput}
                    value={props.databaseAuthData.password}
                    label={"Password"}
                    inputType={InputType.PASSWORD}
                />
            </div>

            <div className={styles.single_form_row}>
                <Input
                    id={"databaseName"}
                    handleInput={handleInput}
                    value={props.databaseAuthData.databaseName}
                    label={"Database Name"}
                    inputType={InputType.TEXT}
                />
            </div>

            <div className={styles.test_connection}>
                <div className={styles.button_wrapper}>
                    <Button type={ButtonType.Text} callback={() => handleTestConnection()} text={"Test Connection"}/>
                </div>

                {connectionState !== undefined && (
                    <>{connectionState ? (<p>Connected</p>) : (<p>Fail to connect</p>)}</>
                )}
            </div>
        </form>
    )
}