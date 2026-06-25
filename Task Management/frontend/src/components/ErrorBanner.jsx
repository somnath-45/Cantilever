import React from "react";

export const ErrorBanner = ({ message }) => {
  if (!message) return null;
  return <div className="banner banner-error">{message}</div>;
};

export default ErrorBanner;
