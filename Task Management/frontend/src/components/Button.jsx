import React from "react";

const VARIANT_CLASS = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
};

export const Button = ({ children, variant = "primary", className = "", ...props }) => {
  return (
    <button className={`btn ${VARIANT_CLASS[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
};

export default Button;
