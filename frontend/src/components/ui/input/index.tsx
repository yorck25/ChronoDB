import styles from "./style.module.scss";
import React from "react";

export const enum InputType {
    TEXT = "text",
    PASSWORD = "password",
    EMAIL = "email",
    NUMBER = "number",
    CHECKBOX = "checkbox",
    RADIO = "radio",
}

export type IconPosition = "leading" | "trailing";

interface InputProps {
    id: string;
    inputType?: InputType;
    label?: string;
    placeholder?: string;
    value: string | number;
    handleInput: (e: Event) => void;
    errorMessage?: string;
    checked?: boolean;
    disabled?: boolean;
    name?: string;
    limit?: number;
    icon?: React.ReactNode;
    iconPosition?: IconPosition;
}

export const Input = ({
                          id,
                          inputType = InputType.TEXT,
                          label,
                          placeholder,
                          value,
                          handleInput,
                          errorMessage,
                          checked,
                          disabled = false,
                          name,
                          limit,
                          icon,
                          iconPosition = "leading",
                      }: InputProps) => {
    const isCheckboxOrRadio =
        inputType === InputType.CHECKBOX || inputType === InputType.RADIO;

    const showIcon = Boolean(icon) && !isCheckboxOrRadio;

    return (
        <div
            className={`${styles.input_group} ${
                errorMessage ? styles.has_error : ""
            } ${isCheckboxOrRadio ? styles.inline_input : ""}`}
        >
            {!isCheckboxOrRadio && label && (
                <label htmlFor={id} className={styles.label}>
                    {label}
                </label>
            )}

            {errorMessage && <p className={styles.error_message}>{errorMessage}</p>}

            <div
                className={`${styles.input_wrapper} ${
                    showIcon ? styles.with_icon : ""
                } ${showIcon ? styles[`icon_${iconPosition}`] : ""}`}
            >
                {showIcon && (
                    <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
                )}

                <input
                    minlength={0}
                    maxlength={limit ? limit : undefined}
                    type={inputType}
                    id={id}
                    name={name}
                    placeholder={placeholder}
                    value={isCheckboxOrRadio ? undefined : value}
                    checked={isCheckboxOrRadio ? checked : undefined}
                    onInput={handleInput}
                    disabled={disabled}
                    className={styles.input}
                />

                {isCheckboxOrRadio && label && (
                    <label htmlFor={id} className={styles.inline_label}>
                        {label}
                    </label>
                )}
            </div>
        </div>
    );
};
