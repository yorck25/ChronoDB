import styles from "./style.module.scss";

interface TextareaProps {
    id: string;
    label?: string;
    placeholder?: string;
    value: string;
    handleInput: (e: Event) => void;
    errorMessage?: string;
    checked?: boolean;
    disabled?: boolean;
    name?: string;
    rows?: number;
}

export const Textarea = ({
                             id,
                             label,
                             placeholder,
                             value,
                             handleInput,
                             errorMessage,
                             disabled = false,
                             name,
                             rows = 3,
                         }: TextareaProps) => {
    return (
        <div className={styles.input_group}>
            {errorMessage && (
                <p className={styles.error_message}>{errorMessage}</p>
            )}

            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label}
                </label>
            )}

            <div className={styles.input_wrapper}>
                <textarea
                    id={id}
                    name={name}
                    placeholder={placeholder}
                    value={value}
                    onInput={handleInput}
                    disabled={disabled}
                    className={styles.input}
                    rows={rows}
                />
            </div>
        </div>
    );
}