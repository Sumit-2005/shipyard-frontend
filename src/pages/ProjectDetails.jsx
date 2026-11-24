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

function ProjectDetails() {
  const [label, setLabel] = useState("");
  const [priority, setPriority] = useState(1);
  const [status, setStatus] = useState("Open");
  const queryClient = useQueryClient();

  const [editingIssueId, setEditingIssueId] = useState(null);
  const [editLabel, setEditLabel] = useState("");
  const [editPriority, setEditPriority] = useState(1);
  const [editStatus, setEditStatus] = useState("Open");

  const { projectId } = useParams({
    strict: false,
  });

  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
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

  const project = projectQuery.data;
  const issues = issuesQuery.data;

  return (
    <div>
      <div className="project-header">
        <h1 className="project-title">{project.overview}</h1>

        <p className="project-deployment">Deployment: {project.deployment}</p>

        <p className="project-id">Project ID: {project.id}</p>
      </div>

      <section>
        <h2>Create New Issue</h2>

        <form onSubmit={handleCreateIssue}>
          <input
            type="text"
            placeholder="Issue title"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />

          <select
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
          >
            <option value={1}>High</option>
            <option value={2}>Medium</option>
            <option value={3}>Low</option>
          </select>

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>

          <button type="submit" disabled={createIssueMutation.isPending}>
            {createIssueMutation.isPending ? "Creating..." : "Create Issue"}
          </button>
        </form>
        {createIssueMutation.isError && (
          <p>{createIssueMutation.error.message}</p>
        )}
      </section>
      <section>
        <h2>Issues</h2>

        {issues.length === 0 ? (
          <p>No issues found for this project.</p>
        ) : (
          issues.map((issue) => (
            <div key={issue.id}>
              {editingIssueId === issue.id ? (
                <form onSubmit={handleUpdateIssue}>
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                  />

                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(Number(e.target.value))}
                  >
                    <option value={1}>High</option>
                    <option value={2}>Medium</option>
                    <option value={3}>Low</option>
                  </select>

                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>

                  <button
                    type="submit"
                    disabled={updateIssueMutation.isPending}
                  >
                    {updateIssueMutation.isPending ? "Saving..." : "Save"}
                  </button>

                  <button type="button" onClick={() => setEditingIssueId(null)}>
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <div className="issue-detail">
                    <h3>{issue.label}</h3>
                    <p>Status: {issue.status}</p>
                    <p>Priority: {issue.priority}</p>
                  </div>
                  <button onClick={() => handleEditIssue(issue)}>Edit</button>

                  <button
                    onClick={() => handleDeleteIssue(issue.id)}
                    disabled={deleteIssueMutation.isPending}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default ProjectDetails;
