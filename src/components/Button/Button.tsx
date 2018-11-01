import * as React from "react";
import "./Button.css";

interface Props {
    onClick: () => void;
    title: string;
    disabled: boolean;
}

const Button = ({onClick, title, disabled}: Props) => {
    return (
        <button className={`button ${disabled && "disabled"}`} onClick={onClick}>
            {title}
        </button>
    );
};

export default Button;