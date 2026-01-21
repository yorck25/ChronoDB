import React from "react";
import styles from './style.module.scss';

export const enum ButtonType {
    Default = 'default',
    Outline = 'outline',
    Link = 'link',
    Text = 'text',
    Icon = 'icon',
}

interface Props {
    id?: string;
    text?: string;
    callback?: (event?: React.MouseEvent<HTMLButtonElement>) => void;
    ariaLabel?: string;
    type?: ButtonType;
    icon?: React.ReactNode;
    large?: boolean;
    dark?: boolean;
    disabled?: boolean;
    isLoading?: boolean;
    htmlType?: "button" | "submit" | "reset";
}

export const Button = (
    {
        id,
        text,
        callback = () => console.log(""),
        ariaLabel,
        type = ButtonType.Default,
        icon,
        large,
        dark = false,
        disabled = false,
        isLoading = false,
        htmlType = "button",
    }: Props) => {

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        callback?.(event);
    };

    return (
        <button
            id={id}
            disabled={disabled}
            aria-label={ariaLabel}
            onClick={handleClick}
            type={htmlType}
            className={`${styles[type]} ${large ? styles.large : ''} ${dark ? styles.dark : ''}`}
        >
            {isLoading ? (
                <span className={styles.loader}></span>
            ) : (
                <>
                    {icon && icon}

                    {type !== ButtonType.Icon &&
                        <span>{text}</span>
                    }
                </>
            )}
        </button>
    );
};
