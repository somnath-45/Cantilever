import React from "react";

export const Card = ({ children, className = "" }) => (
  <div className={`card ${className}`.trim()}>{children}</div>
);

export default Card;
