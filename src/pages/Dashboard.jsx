import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";

import { useNavigate, Link } from "@tanstack/react-router";
import { apiRequest } from "../api/client";
import { getIssues } from "../api/issues";
import { createProject, updateProject, deleteProject } from "../api/projects";
import { useAuth } from "../context/AuthContext";
import { ThemeToggle } from "../context/ThemeContext";

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [overview, setOverview] = useState("");
  const [deployment, setDeployment] = useState("");
  const [editingProjectId, setEditingProjectId] = useState(null);

  const queryClient = useQueryClient();

  // Fetch logged-in user
  const userQuery = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => apiRequest("/users/me"),
  });

  // Fetch projects belonging to this user
  const projectsQuery = useQuery({
    queryKey: ["projects"],
    queryFn: () => apiRequest("/projects/"),
  });

  const projectIssueQueries = useQueries({
    queries: (projectsQuery.data ?? []).map((project) => ({
      queryKey: ["issues", String(project.id)],
      queryFn: () => getIssues(project.id),
    })),
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: createProject,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      setOverview("");
      setDeployment("");
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, projectData }) => updateProject(id, projectData),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      setOverview("");
      setDeployment("");
      setEditingProjectId(null);
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: deleteProject,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });
    },
  });

  function handleLogout() {
    logout();
    navigate({ to: "/login" });
  }

  function handleEditProject(project) {
    setEditingProjectId(project.id);
    setOverview(project.overview);
    setDeployment(project.deployment);
  }

  function handleProjectSubmit(e) {
    e.preventDefault();

    const projectData = {
      overview,
      deployment,
    };

    if (editingProjectId !== null) {
      updateProjectMutation.mutate({
        id: editingProjectId,
        projectData,
      });
    } else {
      createProjectMutation.mutate(projectData);
    }
  }

  function handleCancelEdit() {
    setEditingProjectId(null);
    setOverview("");
    setDeployment("");
  }

  function handleDeleteProject(project) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.overview}"?`,
    );

    if (confirmed) {
      deleteProjectMutation.mutate(project.id);
    }
  }

  // Conditional returns AFTER all hooks
  if (userQuery.isPending || projectsQuery.isPending) {
    return <p>Loading dashboard...</p>;
  }

  if (userQuery.isError || projectsQuery.isError) {
    return <p>Something went wrong while loading your dashboard.</p>;
  }

  const user = userQuery.data;
  const projects = projectsQuery.data;

  return (
    <div className="dashboard">
      <nav className="dashboard-navbar">
        <h1 className="dashboard-brand">
          Shipyard<span>.</span>
        </h1>

        <div className="navbar-user-actions">
          <ThemeToggle />
          <div className="user-info-card">
            <div className="user-avatar">
              {user.email.charAt(0).toUpperCase()}
            </div>

            <div className="user-details">
              <p className="user-label">SIGNED IN AS</p>
              <h3>{user.email}</h3>
            </div>
          </div>

          <button className="btn btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-content">
        <section className="dashboard-heading">
          <p className="dashboard-eyebrow">OVERVIEW</p>
          <h1>Welcome back!</h1>
          <p>Here's what's happening with your projects today.</p>
        </section>

        <section className="projects-section">
          <div className="section-header">
            <div>
              <h2>Your Projects</h2>
              <p>Manage and track all your projects.</p>
            </div>

            <span className="project-count">{projects.length} Projects</span>
          </div>

          <form className="project-form" onSubmit={handleProjectSubmit}>
            <h3>
              {editingProjectId !== null
                ? "Edit project"
                : "Create a new project"}
            </h3>

            <div className="form-group">
              <label htmlFor="overview">Project overview</label>

              <input
                id="overview"
                className="form-input"
                type="text"
                placeholder="Enter your project overview"
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="deployment">Deployment URL</label>

              <input
                id="deployment"
                className="form-input"
                type="url"
                placeholder="https://example.com"
                value={deployment}
                onChange={(e) => setDeployment(e.target.value)}
                required
              />
            </div>

            {(createProjectMutation.isError ||
              updateProjectMutation.isError) && (
              <p className="error-message">
                {createProjectMutation.error?.message ||
                  updateProjectMutation.error?.message}
              </p>
            )}

            <div className="project-form-actions">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={
                  createProjectMutation.isPending ||
                  updateProjectMutation.isPending
                }
              >
                {createProjectMutation.isPending
                  ? "Creating..."
                  : updateProjectMutation.isPending
                    ? "Saving changes..."
                    : editingProjectId !== null
                      ? "Save Changes"
                      : "Create Project"}
              </button>

              {editingProjectId !== null && (
                <button
                  className="btn btn-cancel"
                  type="button"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {deleteProjectMutation.isError && (
            <p className="error-message">
              {deleteProjectMutation.error.message}
            </p>
          )}

          {projects.length === 0 ? (
            <div className="empty-state">
              <h3>No projects yet</h3>
              <p>
                You haven't created any projects. Your projects will appear
                here.
              </p>
            </div>
          ) : (
            <div className="project-grid">
              {projects.map((project, index) => {
                const issueQuery = projectIssueQueries[index];

                return (
                  <div className="project-card" key={project.id}>
                    <div className="project-card-top">
                      <span className="project-id">
                        PROJECT ID - {project.id}
                      </span>
                      <span className="project-indicator"></span>
                    </div>

                    <h3>{project.overview}</h3>

                    <p className="project-description">{project.deployment}</p>

                    {issueQuery.isPending && (
                      <p className="project-issue-count-message" role="status">
                        Loading issue counts...
                      </p>
                    )}
                    {issueQuery.isError && (
                      <p
                        className="project-issue-count-message is-error"
                        role="alert"
                      >
                        Issue counts unavailable: {issueQuery.error.message}
                      </p>
                    )}
                    {issueQuery.isSuccess && (
                      <div
                        className="project-issue-counts"
                        aria-label="Issue status counts"
                      >
                        <div className="project-issue-count">
                          <span>Open</span>
                          <strong>
                            {
                              issueQuery.data.filter(
                                (issue) => issue.status === "Open",
                              ).length
                            }
                          </strong>
                        </div>
                        <div className="project-issue-count">
                          <span>In Progress</span>
                          <strong>
                            {
                              issueQuery.data.filter(
                                (issue) => issue.status === "In Progress",
                              ).length
                            }
                          </strong>
                        </div>
                      </div>
                    )}

                    <div className="project-card-footer">
                      <Link
                        to="/projects/$projectId"
                        params={{ projectId: String(project.id) }}
                        style={{
                          textDecoration: "none",
                          color: "black",
                          fontSize: "12px",
                        }}
                      >
                        View Project →
                      </Link>

                      <div className="project-actions">
                        <button
                          className="btn btn-edit"
                          type="button"
                          onClick={() => handleEditProject(project)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn btn-delete"
                          type="button"
                          onClick={() => handleDeleteProject(project)}
                          disabled={deleteProjectMutation.isPending}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
