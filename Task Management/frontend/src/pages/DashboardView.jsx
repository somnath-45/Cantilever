import React, { useContext, useEffect } from "react";
import { TaskContext } from "../context/TaskContext";
import { AuthContext } from "../context/AuthContext";
import { Card } from "../components/Card";

const StatCard = ({ label, value, accent }) => (
  <Card className={`card--padded stat-card stat-card--${accent}`}>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
  </Card>
);

export const DashboardView = () => {
  const { tasks, loading, refreshTasks } = useContext(TaskContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    refreshTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const review = tasks.filter((t) => t.status === "review").length;
  const todo = tasks.filter((t) => t.status === "todo").length;

  return (
    <div className="stack fade-in">
      <div className="page-heading">
        <h1>Dashboard</h1>
        <p>{user.role === "manager" ? "Overview of every task across your team." : "Overview of your tasks and progress."}</p>
      </div>
      <div className="stat-grid">
        <StatCard label="Total Tasks" value={loading ? "—" : total} accent="indigo" />
        <StatCard label="To Do" value={loading ? "—" : todo} accent="slate" />
        <StatCard label="In Progress" value={loading ? "—" : inProgress} accent="blue" />
        <StatCard label="In Review" value={loading ? "—" : review} accent="amber" />
        <StatCard label="Completed" value={loading ? "—" : done} accent="emerald" />
      </div>
    </div>
  );
};

export default DashboardView;
