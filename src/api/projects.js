import { apiRequest } from "./client";

export async function createProject(projectData) {
  return apiRequest("/projects/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectData),
  });
}

export async function updateProject(id, projectData) {
  return apiRequest(`/projects/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(projectData),
  });
}

export async function deleteProject(id) {
  return apiRequest(`/projects/${id}`, {
    method: "DELETE",
  });
}

export async function getProject(id) {
  return apiRequest(`/projects/${id}`);
}
