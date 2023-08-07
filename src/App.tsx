import { Router, useLocation, useNavigate, useRoutes } from "@solidjs/router";
import { createEffect, lazy } from "solid-js";

const routes = [
  {
    path: "/",
    component: lazy(() => import("./pages/index")),
  },
  {
    path: "/skills",
    component: lazy(() => import("./pages/skills")),
  },
  {
    path: "/contact",
    component: lazy(() => import("./pages/contact")),
  },
  {
    path: "/assets",
    component: lazy(() => import("./pages/assets")),
  },
  {
    path: "/*all",
    component: lazy(() => import("./pages/404")),
  },
];

export function App({ path }: { path?: string }) {
  const Routes = useRoutes(routes);

  return (
    <Router url={path}>
      <LinkHyjack />
      <Routes />
    </Router>
  );
}

function LinkHyjack() {
  const navigate = useNavigate();
  const location = useLocation();

  // Progressive enhancement for links
  // This would be better done with the Navigation API, but it's not supported in all browsers yet
  // https://developer.chrome.com/docs/web-platform/navigation-api/
  createEffect(() => {
    document.querySelectorAll("a").forEach((link) => {
      if (link.href === "") return;

      const url = new URL(link.href);
      if (url.origin === window.location.origin) {
        link.addEventListener("click", (event) => {
          if (url.pathname === "/disabled") event.preventDefault();

          if (routes.find((route) => route.path === url.pathname)) {
            event.preventDefault();
            navigate(url.pathname);
          }
        });
      }
    });
  });

  return null;
}
