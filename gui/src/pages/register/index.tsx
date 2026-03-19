import styles from "./style.module.scss";
import React, { useState } from "react";
import type {IRegisterRequest} from "../../models/user.models.ts";
import {useAppContext} from "../../contexts/app.context.tsx";
import {Button, ButtonType} from "../../components/ui/button";
import type {TargetedMouseEvent} from "preact";
import {useNavigate} from "react-router-dom";

interface IRegistrationFormData {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
    termsAccepted: boolean;
}

export const RegisterPage = () => {
    const navigate = useNavigate();
    const {registerRequest} = useAppContext();

    const [registrationFormData, setRegistrationFormData] = useState<IRegistrationFormData>({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        termsAccepted: false,
    });
    const [isFormValid, setIsFormValid] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.currentTarget;
        const { id, type, value, checked } = target;

        const fieldValue = type === "checkbox" ? checked : value;

        setRegistrationFormData((prev) => {
            const updated = { ...prev, [id]: fieldValue };

            const valid =
               !!( updated.firstName.trim() &&
                updated.lastName.trim() &&
                updated.email.trim() &&
                updated.username.trim().length >= 3 &&
                updated.password.trim() &&
                updated.password === updated.confirmPassword &&
                updated.termsAccepted);

            setIsFormValid(valid);
            return updated;
        });
    };

    const handleSubmit = (e: Event) => {
        setErrorMessage(undefined);
        setIsLoading(true);

        if (!isFormValid) {
            setErrorMessage("Please fill in all fields correctly.");
        }

        e.preventDefault();

        const rr: IRegisterRequest = {
            firstName: registrationFormData.firstName,
            lastName: registrationFormData.lastName,
            email: registrationFormData.email,
            username: registrationFormData.username,
            password: registrationFormData.password,
            termsAccepted: registrationFormData.termsAccepted,
        }

        registerRequest(rr).then(res => {
            setIsLoading(false);
            if (res) {
                navigate("/");
                return;
            } else {
                setErrorMessage("Registration failed. Please try again.");
            }
        });
    };

    return (
        <div className={styles.register_page}>
            <div className={styles.register_container}>
                <div className={styles.register_header}>
                    <h1>Create an Account</h1>
                    <p>Create an account and start managing your databases throughout the world.</p>
                </div>

                {errorMessage && (
                    <div className={styles.error_msg}>
                        <p>{errorMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className={styles.register_form}>
                    <div className={styles.form_row}>
                        <div className={styles.form_group}>
                            <label htmlFor="firstName">First name</label>
                            <input
                                type="text"
                                id="firstName"
                                placeholder="Max"
                                value={registrationFormData.firstName}
                                onChange={handleInput}
                            />
                        </div>

                        <div className={styles.form_group}>
                            <label htmlFor="lastName">Last name</label>
                            <input
                                type="text"
                                id="lastName"
                                placeholder="Musterman"
                                value={registrationFormData.lastName}
                                onChange={handleInput}
                            />
                        </div>
                    </div>

                    <div className={styles.form_row}>
                        <div className={styles.form_group}>
                            <label htmlFor="email">Email Address</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="mmusterman@mail.com"
                                value={registrationFormData.email}
                                onChange={handleInput}
                            />
                        </div>

                        <div className={styles.form_group}>
                            <label htmlFor="username">Username</label>
                            <input
                                type="text"
                                id="username"
                                placeholder="mmusterman"
                                value={registrationFormData.username}
                                onChange={handleInput}
                            />
                        </div>
                    </div>

                    <div className={styles.form_row}>
                        <div className={styles.form_group}>
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••••"
                                value={registrationFormData.password}
                                onChange={handleInput}
                            />
                        </div>

                        <div className={styles.form_group}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                placeholder="••••••••••"
                                value={registrationFormData.confirmPassword}
                                onChange={handleInput}
                            />
                        </div>
                    </div>

                    <div className={styles.checkbox_group}>
                        <input
                            type="checkbox"
                            id="termsAccepted"
                            checked={registrationFormData.termsAccepted}
                            onChange={handleInput}
                        />
                        <label htmlFor="termsAccepted">I agree to the terms and conditions</label>
                    </div>

                    <div className={styles.form_actions}>
                        <Button text={"Sign Up"} disabled={!isFormValid} callback={(event?: TargetedMouseEvent<HTMLButtonElement> | undefined) => handleSubmit(event!)}
                                ariaLabel={"sign up button"} type={ButtonType.Default} isLoading={isLoading}>
                        </Button>

                        <Button text={"Sign In"} callback={() => navigate("/login")}
                                ariaLabel={"sign in button"} type={ButtonType.Outline}>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};