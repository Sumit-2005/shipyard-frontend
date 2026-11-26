import { useParams } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProject } from "../api/projects";
import {
  getIssues,
  createIssue,
  deleteIssue,
  updateIssue,
} from "../api/issues";
import { useState } from "react";
import { apiRequest } from "../api/client";
import Navbar from "../components/Navbar";

const ISSUE_STATUSES = ["Open", "In Progress", "Closed"];

function ProjectDetails() {
  const [label, setLabel] = useState("");
  const [priority, setPriority] = useState(1);
  const [status, setStatus] = useState("Open");
  const queryClient = useQueryClient();

  const [editingIssueId, setEditingIssueId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editPriority, setEditPriority] = useState(1);
  const [editStatus, setEditStatus] = useState("Open");
  const [draggedIssueId, setDraggedIssueId] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  const { projectId } = useParams({
    strict: false,
  });

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
  });

  const userQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => apiRequest("/users/me"),
  });

  const issuesQuery = useQuery({
    queryKey: ["issues", projectId],
    queryFn: () => getIssues(projectId),
  });

  const createIssueMutation = useMutation({
    mutationFn: createIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["issues", projectId],
      });

      setLabel("");
      setPriority(1);
      setStatus("Open");
    },
  });

  const deleteIssueMutation = useMutation({
    mutationFn: deleteIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["issues", projectId],
      });
    },
  });

  const updateIssueMutation = useMutation({
    mutationFn: ({ id, issueData }) => updateIssue(id, issueData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["issues", projectId],
      });

      setEditingIssueId(null);
    },
  });

  if (projectQuery.isLoading) {
    return <p>Loading project...</p>;
  }

  if (projectQuery.isError) {
    return <p>Error: {projectQuery.error.message}</p>;
  }

  if (issuesQuery.isLoading) {
    return <p>Loading issues...</p>;
  }

  if (issuesQuery.isError) {
    return <p>Error loading issues: {issuesQuery.error.message}</p>;
  }

  function handleCreateIssue(e) {
    e.preventDefault();

    createIssueMutation.mutate({
      label,
      priority,
      status,
      project_id: Number(projectId),
    });
  }

  function handleDeleteIssue(issueId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this issue?",
    );

    if (confirmed) {
      deleteIssueMutation.mutate(issueId);
    }
  }

  function handleEditIssue(issue) {
    setEditingIssueId(issue.id);
    setEditLabel(issue.label);
    setEditPriority(issue.priority);
    setEditStatus(issue.status);
  }

  function handleUpdateIssue(e) {
    e.preventDefault();

    updateIssueMutation.mutate({
      id: editingIssueId,
      issueData: {
        label: editLabel,
        priority: editPriority,
        status: editStatus,
        project_id: Number(projectId),
      },
    });
  }

  function moveIssue(issue, nextStatus) {
    if (updateIssueMutation.isPending || issue.status === nextStatus) {
      return;
    }

    updateIssueMutation.mutate({
      id: issue.id,
      issueData: {
        label: issue.label,
        priority: issue.priority,
        status: nextStatus,
        project_id: Number(projectId),
      },
    });
  }

  function handleIssueDrop(e, nextStatus) {
    e.preventDefault();
    setDragOverStatus(null);

    const issue = issues.find(
      (item) => String(item.id) === e.dataTransfer.getData("text/plain"),
    );

    if (issue) {
      moveIssue(issue, nextStatus);
    }
  }

  const project = projectQuery.data;
  const issues = issuesQuery.data;

  return (
    <div className="project-details-page">
      <Navbar
        email={
          userQuery.data?.email ??
          (userQuery.isError ? "Account unavailable" : "Loading account...")
        }
      />
      <main className="project-details-content">
        <div className="project-header">
          <h1 className="project-title">{project.overview}</h1>

          {project.deployment ? (
            <p className="project-deployment">
              Deployment:{" "}
              <a
                className="deployment-link"
                href={project.deployment}
                target="_blank"
                rel="noopener noreferrer"
              >
                {project.deployment}
              </a>
            </p>
          ) : null}

          <p className="project-detail-id">Project ID: {project.id}</p>
        </div>

        <section className="project-details-section">
          <h2>Create New Issue</h2>

          <form className="issue-form" onSubmit={handleCreateIssue}>
            <input
              type="text"
              placeholder="Issue title"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />

            <label className="issue-field">
              <span>Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              >
                <option value={1}>High</option>
                <option value={2}>Medium</option>
                <option value={3}>Low</option>
              </select>
            </label>

            <label className="issue-field">
              <span>Status</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </label>

            <button type="submit" disabled={createIssueMutation.isPending}>
              {createIssueMutation.isPending ? "Creating..." : "Create Issue"}
            </button>
          </form>
          {createIssueMutation.isError && (
            <p>{createIssueMutation.error.message}</p>
          )}
        </section>
        <section className="project-details-section">
          <h2>Issues</h2>
          <p className="kanban-help">
            Drag issues between columns or use the status selector to move them.
          </p>
          {updateIssueMutation.isError && (
            <p className="error-message" role="alert">
              Could not update issue status: {updateIssueMutation.error.message}
            </p>
          )}
          <div className="kanban-board">
            {ISSUE_STATUSES.map((columnStatus) => {
              const columnIssues = issues.filter(
                (issue) => issue.status === columnStatus,
              );

              return (
                <section
                  className={`kanban-column${dragOverStatus === columnStatus ? " is-drag-over" : ""}`}
                  key={columnStatus}
                  aria-label={`${columnStatus} issues`}
                  onDragOver={(e) => {
                    if (!updateIssueMutation.isPending) {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      setDragOverStatus(columnStatus);
                    }
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setDragOverStatus(null);
                    }
                  }}
                  onDrop={(e) => handleIssueDrop(e, columnStatus)}
                >
                  <div className="kanban-column-header">
                    <h3>{columnStatus}</h3>
                    <span className="kanban-count">{columnIssues.length}</span>
                  </div>

                  <div className="kanban-column-content">
                    {columnIssues.length === 0 ? (
                      <p className="kanban-empty">No issues</p>
                    ) : (
                      columnIssues.map((issue) => (
                        <article
                          className={`issue-card kanban-card${draggedIssueId === issue.id ? " is-dragging" : ""}`}
                          key={issue.id}
                          draggable={
                            editingIssueId !== issue.id &&
                            !updateIssueMutation.isPending
                          }
                          onDragStart={(e) => {
                            e.dataTransfer.setData(
                              "text/plain",
                              String(issue.id),
                            );
                            e.dataTransfer.effectAllowed = "move";
                            setDraggedIssueId(issue.id);
                          }}
                          onDragEnd={() => {
                            setDraggedIssueId(null);
                            setDragOverStatus(null);
                          }}
                        >
                          {editingIssueId === issue.id ? (
                            <form
                              className="issue-edit-form"
                              onSubmit={handleUpdateIssue}
                            >
                              <input
                                type="text"
                                value={editLabel}
                                onChange={(e) => setEditLabel(e.target.value)}
                              />

                              <select
                                value={editPriority}
                                onChange={(e) =>
                                  setEditPriority(Number(e.target.value))
                                }
                              >
                                <option value={1}>High</option>
                                <option value={2}>Medium</option>
                                <option value={3}>Low</option>
                              </select>

                              <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                              >
                                {ISSUE_STATUSES.map((issueStatus) => (
                                  <option key={issueStatus} value={issueStatus}>
                                    {issueStatus}
                                  </option>
                                ))}
                              </select>

                              <button
                                type="submit"
                                disabled={updateIssueMutation.isPending}
                              >
                                {updateIssueMutation.isPending
                                  ? "Saving..."
                                  : "Save"}
                              </button>

                              <button
                                type="button"
                                onClick={() => setEditingIssueId(null)}
                              >
                                Cancel
                              </button>
                            </form>
                          ) : (
                            <>
                              <div className="issue-detail">
                                <h3>{issue.label}</h3>
                                <p>Priority: {issue.priority}</p>
                              </div>
                              <div className="issue-actions">
                                <select
                                  className="kanban-status-select"
                                  aria-label={`Move ${issue.label} to status`}
                                  value={issue.status}
                                  onChange={(e) =>
                                    moveIssue(issue, e.target.value)
                                  }
                                  disabled={updateIssueMutation.isPending}
                                >
                                  {ISSUE_STATUSES.map((issueStatus) => (
                                    <option
                                      key={issueStatus}
                                      value={issueStatus}
                                    >
                                      {issueStatus}
                                    </option>
                                  ))}
                                </select>
                                <button onClick={() => handleEditIssue(issue)}>
                                  Edit
                                </button>

                                <button
                                  onClick={() => handleDeleteIssue(issue.id)}
                                  disabled={deleteIssueMutation.isPending}
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </article>
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

export default ProjectDetails;
