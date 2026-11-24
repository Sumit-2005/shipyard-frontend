import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import ProjectDetails from "../pages/ProjectDetails";

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: Register,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",

  beforeLoad: () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw redirect({
        to: "/login",
      });
    }
  },

  component: Dashboard,
});

const projectDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$projectId",
  beforeLoad: () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      throw redirect({ to: "/login" });
    }
  },
  component: ProjectDetails,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  dashboardRoute,
  projectDetailsRoute,
]);

export const router = createRouter({
  routeTree,
});
