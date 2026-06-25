import React from "react";

const STATUS_LABEL = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "In Review",
  done: "Completed",
};

export const Badge = ({ status }) => {
  const label = STATUS_LABEL[status] || STATUS_LABEL.todo;
  return <span className={`badge badge-status-${status || "todo"}`}>{label}</span>;
};

const PRIORITY_LABEL = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PriorityBadge = ({ priority }) => {
  const label = PRIORITY_LABEL[priority] || PRIORITY_LABEL.medium;
  return <span className={`badge badge-priority-${priority || "medium"}`}>{label} priority</span>;
};

export default Badge;
