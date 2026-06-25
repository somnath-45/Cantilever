import client from "./client";

export async function getAllTasks({ skip = 0, limit = 100 } = {}) {
  const { data } = await client.get("/task/all_tasks", { params: { skip, limit } });
  return data;
}

export async function getDeletedTasks() {
  const { data } = await client.get("/task/deleted_tasks");
  return data;
}

export async function filterTasks({ skip = 0, limit = 100, priority, task_status, deadline } = {}) {
  const params = { skip, limit };
  if (priority) params.priority = priority;
  if (task_status) params.task_status = task_status;
  if (deadline) params.deadline = deadline;
  const { data } = await client.get("/task/filter_task", { params });
  return data;
}

export async function createTask(payload) {
  const { data } = await client.post("/task/add_task", payload);
  return data;
}

export async function updateTask(taskId, payload) {
  const { data } = await client.patch(`/task/update_task/${taskId}`, payload);
  return data;
}

export async function deleteTask(taskId) {
  await client.delete(`/task/delete_task/${taskId}`);
}

export async function restoreTask(taskId) {
  const { data } = await client.patch(`/task/restore_task/${taskId}`);
  return data;
}

export async function updateTaskStatus(taskId, status) {
  const { data } = await client.get(`/task/update_progress/${taskId}`, {
    params: { progress: status },
  });
  return data;
}

export async function updateTaskPriority(taskId, priority) {
  const { data } = await client.get(`/task/update_priority/${taskId}`, {
    params: { priority },
  });
  return data;
}
