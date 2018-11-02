import * as React from "react";
import styles from "./Button.module.css";

interface Props {
    onClick: () => void;
    title: string;
    disabled: boolean;
}

const Button = ({onClick, title, disabled}: Props) => {
    return (
        <button className={`${styles.button} ${disabled && styles.disabled}`} onClick={onClick}>
            {title}
        </button>
    );
};

export default Button;