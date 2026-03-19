import styles from "./style.module.scss";

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps {
    id: string;
    label?: string;
    value: string;
    options: SelectOption[];
    placeholder?: string;
    handleChange: (e: Event) => void;
    errorMessage?: string;
    disabled?: boolean;
    name?: string;
}

export const Select = ({
                           id,
                           label,
                           value,
                           options,
                           placeholder,
                           handleChange,
                           errorMessage,
                           disabled = false,
                           name,
                       }: SelectProps) => {
    return (
        <div
            className={`${styles.input_group} ${
                errorMessage ? styles.has_error : ""
            }`}
        >
            {label && (
                <label htmlFor={id} className={styles.label}>
                    {label}
                </label>
            )}

            <select
                id={id}
                name={name}
                value={value}
                onChange={handleChange as any}
                disabled={disabled}
                className={styles.select}
            >
                {(placeholder || value === "") && (
                    <option value="" disabled hidden>
                        {placeholder}
                    </option>
                )}
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {errorMessage && (
                <p className={styles.error_message}>{errorMessage}</p>
            )}
        </div>
    );
};
