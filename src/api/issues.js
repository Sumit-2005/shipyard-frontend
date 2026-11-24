import { apiRequest } from "./client";

export async function getIssues(projectId) {
  return apiRequest(`/issues/?project_id=${projectId}`);
}

export async function createIssue(issueData) {
  return apiRequest("/issues/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(issueData),
  });
}

export async function updateIssue(id, issueData) {
  return apiRequest(`/issues/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(issueData),
  });
}

export async function deleteIssue(id) {
  return apiRequest(`/issues/${id}`, {
    method: "DELETE",
  });
}
