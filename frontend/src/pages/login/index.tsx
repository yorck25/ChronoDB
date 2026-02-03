import styles from "./style.module.scss";
import React, {useState} from "react";
import type {ILoginRequest} from "../../models/user.models.ts";
import {useAppContext} from "../../contexts/app.context.tsx";
import {Button, ButtonType} from "../../components/ui/button";
import type {TargetedMouseEvent} from "preact";
import {useNavigate} from "react-router-dom";

interface ILoginFormData {
    username: string;
    password: string;
}

export const LoginPage = () => {
    const navigate = useNavigate();
    const {loginRequest} = useAppContext();

    const [loginFormData, setLoginFormData] = useState<ILoginFormData>({
        username: "",
        password: "",
    });
    const [isFormValid, setIsFormValid] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.currentTarget;
        const {id, type, value, checked} = target;

        const fieldValue = type === "checkbox" ? checked : value;

        setLoginFormData((prev) => {
            const updated = {...prev, [id]: fieldValue};

            const valid =
                !!(
                    updated.username.trim().length >= 3 &&
                    updated.password.trim()
                );

            setIsFormValid(valid);
            return updated;
        });
    };

    const handleSubmit = (e: Event) => {
        e.preventDefault();
        console.log("test")
        setErrorMessage(undefined);
        setIsLoading(true);

        if (!isFormValid) {
            setErrorMessage("Please fill in all fields correctly.");
        }

        e.preventDefault();

        const lr: ILoginRequest = {
            username: loginFormData.username,
            password: loginFormData.password,
        }

        loginRequest(lr).then(res => {
            setIsLoading(false);
            if (res) {
                navigate("/");
                return;
            } else {
                setErrorMessage("Login failed. Please try again.");
            }
        });
    };

    return (
        <div className={styles.login_page}>
            <div className={styles.login_container}>
                <div className={styles.login_header}>
                    <h1>Login to your Account</h1>
                    <p>Login an make your Database a little better.</p>
                </div>

                {errorMessage && (
                    <div className={styles.error_msg}>
                        <p>{errorMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.login_form}>
                    <div className={styles.form_row}>
                        <div className={styles.form_group}>
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                placeholder="mmusterman"
                                value={loginFormData.username}
                                onChange={handleInput}
                            />
                        </div>

                        <div className={styles.form_group}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••••"
                                value={loginFormData.password}
                                onChange={handleInput}
                            />
                        </div>
                    </div>

                    <div className={styles.form_actions}>
                        <Button htmlType={"submit"} text={"Sign In"}  disabled={!isFormValid}
                                callback={(event?: TargetedMouseEvent<HTMLButtonElement> | undefined) => handleSubmit(event!)}
                                ariaLabel={"sign in button"} type={ButtonType.Default} isLoading={isLoading}>
                        </Button>

                        <Button text={"Sign Up"}
                                callback={() => navigate("/register")}
                                ariaLabel={"sign up button"} type={ButtonType.Outline} >
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};