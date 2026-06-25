import React, { useState, useContext, useMemo, useEffect } from "react";
import { Plus, Clock, Users, Trash2, Edit2, RotateCcw, CheckSquare, CalendarDays } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { TaskContext } from "../context/TaskContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Badge, PriorityBadge } from "../components/Badge";
import { Modal } from "../components/Modal";
import { ErrorBanner } from "../components/ErrorBanner";
import { extractErrorMessage } from "../api/client";

const STATUS_FLOW = [
  { value: "todo", label: "Set To Do", className: "btn-action--neutral" },
  { value: "in_progress", label: "Start Work", className: "btn-action--progress" },
  { value: "review", label: "Send to Review", className: "btn-action--review" },
  { value: "done", label: "Complete", className: "btn-action--done" },
];

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function toDateInputValue(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export const TasksView = ({ searchQuery, showDeleted }) => {
  const { user } = useContext(AuthContext);
  const {
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
  } = useContext(TaskContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [actionError, setActionError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (showDeleted) refreshDeletedTasks();
    else refreshTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDeleted]);

  const viewableTasks = useMemo(() => {
    let result = showDeleted ? deletedTasks : tasks;

    if (filter !== "ALL") {
      result = result.filter((t) => t.status === filter.toLowerCase());
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) => t.task_name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [tasks, deletedTasks, showDeleted, filter, searchQuery]);

  const handleCreateOrEditTask = async (e) => {
    e.preventDefault();
    setActionError("");
    const formData = new FormData(e.target);
    const taskData = {
      title: formData.get("title"),
      description: formData.get("description"),
      priority: formData.get("priority"),
      dueDate: formData.get("dueDate"),
      assignedTo: formData.get("assignedTo"),
    };

    try {
      if (editingTask) {
        await editTask(editingTask.id, taskData);
      } else {
        await addTask(taskData);
      }
      closeModal();
    } catch (err) {
      setActionError(extractErrorMessage(err, "Couldn't save the task."));
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setActionError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    setActionError("");
  };

  const handleStatusChange = async (taskId, status) => {
    setBusyId(taskId);
    setActionError("");
    try {
      await updateTaskStatus(taskId, status);
    } catch (err) {
      setActionError(extractErrorMessage(err, "Couldn't update status."));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (taskId) => {
    setBusyId(taskId);
    setActionError("");
    try {
      await deleteTask(taskId);
    } catch (err) {
      setActionError(extractErrorMessage(err, "Couldn't delete the task."));
    } finally {
      setBusyId(null);
    }
  };

  const handleRestore = async (taskId) => {
    setBusyId(taskId);
    setActionError("");
    try {
      await restoreTask(taskId);
    } catch (err) {
      setActionError(extractErrorMessage(err, "Couldn't restore the task."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="stack fade-in">
      <div className="tasks-header">
        <div className="page-heading">
          <h1>{showDeleted ? "Deleted Tasks" : user.role === "manager" ? "Team Tasks Overview" : "My Assigned Tasks"}</h1>
          <p>
            {showDeleted
              ? "Review and restore removed tasks."
              : user.role === "manager"
              ? "Manage and assign work to your team."
              : "Update the status of work assigned to you."}
          </p>
        </div>

        {user.role === "manager" && !showDeleted && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Assign New Task
          </Button>
        )}
      </div>

      {error && <ErrorBanner message={error} />}
      {actionError && <ErrorBanner message={actionError} />}

      <Card>
        <div className="filter-bar">
          {["ALL", "TODO", "IN_PROGRESS", "REVIEW", "DONE"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-pill ${filter === f ? "filter-pill--active" : ""}`}
            >
              {f.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="task-list">
          {loading ? (
            <div className="loading-state">Loading tasks…</div>
          ) : viewableTasks.length === 0 ? (
            <div className="empty-state">
              <CheckSquare size={40} />
              <p>No tasks found in this view.</p>
            </div>
          ) : (
            viewableTasks.map((task) => (
              <div key={task.id} className={`task-row ${showDeleted ? "task-row--deleted" : ""}`}>
                <div className="task-main">
                  <div className="task-badges">
                    <Badge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    <span className="task-id">ID: {task.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <h4 className={`task-title ${task.status === "done" ? "task-title--done" : ""}`}>
                    {task.task_name}
                  </h4>
                  {task.description && <p className="task-description">{task.description}</p>}

                  <div className="task-meta">
                    <span className="task-meta-item">
                      <Users size={14} /> Assigned: {task.assigned_to}
                    </span>
                    <span className="task-meta-item">
                      <Clock size={14} /> Created: {formatDate(task.created_at)}
                    </span>
                    <span className="task-meta-item">
                      <CalendarDays size={14} /> Due: {formatDate(task.due_date)}
                    </span>
                  </div>
                </div>

                <div className="task-actions">
                  {!showDeleted &&
                    STATUS_FLOW.filter((s) => s.value !== task.status).map((s) => (
                      <Button
                        key={s.value}
                        variant="ghost"
                        className={`btn-action ${s.className}`}
                        disabled={busyId === task.id}
                        onClick={() => handleStatusChange(task.id, s.value)}
                      >
                        {s.label}
                      </Button>
                    ))}
                  {showDeleted && user.role === "manager" && (
                    <Button
                      variant="ghost"
                      className="btn-action btn-action--done"
                      disabled={busyId === task.id}
                      onClick={() => handleRestore(task.id)}
                    >
                      <RotateCcw size={16} /> Restore Task
                    </Button>
                  )}
                </div>

                {!showDeleted && user.role === "manager" && (
                  <div className="task-manager-tools">
                    <Button variant="ghost" className="icon-btn" onClick={() => openEditModal(task)}>
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      className="icon-btn icon-btn--danger"
                      disabled={busyId === task.id}
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {user.role === "manager" && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTask ? "Edit Task Details" : "Assign New Task"}>
          <form onSubmit={handleCreateOrEditTask} className="form-stack">
            {actionError && <ErrorBanner message={actionError} />}
            <div className="form-group">
              <label className="form-label">Task Title</label>
              <input
                name="title"
                defaultValue={editingTask?.task_name || ""}
                required
                className="input"
                placeholder="E.g., Fix Navigation Bug"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                defaultValue={editingTask?.description || ""}
                rows="3"
                className="input"
                placeholder="Provide details for the contributor…"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select name="priority" defaultValue={editingTask?.priority || "medium"} className="input">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  defaultValue={toDateInputValue(editingTask?.due_date)}
                  className="input"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Assign To (username)</label>
              <input
                name="assignedTo"
                defaultValue={editingTask?.assigned_to || ""}
                required
                placeholder="contributor's username"
                className="input"
              />
            </div>
            <div className="form-actions">
              <Button type="button" variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button type="submit">{editingTask ? "Save Changes" : "Assign Task"}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TasksView;
