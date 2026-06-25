import React, { createContext, useState, useContext, useCallback, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import * as taskApi from "../api/tasks";
import { extractErrorMessage } from "../api/client";

export const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await taskApi.getAllTasks();
      setTasks(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't load tasks."));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshDeletedTasks = useCallback(async () => {
    if (user?.role !== "manager") return;
    setLoading(true);
    setError("");
    try {
      const data = await taskApi.getDeletedTasks();
      setDeletedTasks(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Couldn't load deleted tasks."));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const addTask = async (taskData) => {
    if (user.role !== "manager") return;
    const created = await taskApi.createTask({
      task_name: taskData.title,
      description: taskData.description || null,
      priority: taskData.priority || "medium",
      due_date: taskData.dueDate ? new Date(taskData.dueDate).toISOString() : null,
      assigned_to: taskData.assignedTo,
    });
    setTasks((prev) => [created, ...prev]);
  };

  const editTask = async (taskId, updates) => {
    if (user.role !== "manager") return;
    const updated = await taskApi.updateTask(taskId, {
      task_name: updates.title,
      description: updates.description || null,
      priority: updates.priority,
      due_date: updates.dueDate ? new Date(updates.dueDate).toISOString() : null,
      assigned_to: updates.assignedTo,
    });
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const deleteTask = async (taskId) => {
    if (user.role !== "manager") return;
    await taskApi.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const restoreTask = async (taskId) => {
    if (user.role !== "manager") return;
    const restored = await taskApi.restoreTask(taskId);
    setDeletedTasks((prev) => prev.filter((t) => t.id !== taskId));
    setTasks((prev) => [restored, ...prev]);
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    const prev = tasks;
    setTasks((curr) => curr.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await taskApi.updateTaskStatus(taskId, newStatus);
    } catch (err) {
      setTasks(prev);
      throw err;
    }
  };

  const updateTaskPriority = async (taskId, newPriority) => {
    if (user.role !== "manager") return;
    const prev = tasks;
    setTasks((curr) => curr.map((t) => (t.id === taskId ? { ...t, priority: newPriority } : t)));
    try {
      await taskApi.updateTaskPriority(taskId, newPriority);
    } catch (err) {
      setTasks(prev);
      throw err;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        deletedTasks,
        loading,
        error,
        refreshTasks,
        refreshDeletedTasks,
        addTask,
        editTask,
        deleteTask,
        restoreTask,
        updateTaskStatus,
        updateTaskPriority,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
