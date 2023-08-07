import { Router, useLocation, useNavigate, useRoutes } from "@solidjs/router";
import { createEffect, lazy as solidLazy } from "solid-js";

import IndexPage from "./pages/index";
import SkillsPage from "./pages/skills";
import ContactsPages from "./pages/contact";
import AssetsPage from "./pages/assets";
import NotFoundPage from "./pages/404";

// TODO: Lazy loading components - https://github.com/withastro/astro/pull/6791
const routes = [
  {
    path: "/",
    component: IndexPage,
  },
  {
    path: "/skills",
    component: SkillsPage,
  },
  {
    path: "/contact",
    component: ContactsPages,
  },
  {
    path: "/assets",
    component: AssetsPage,
  },
  {
    path: "/*all",
    component: NotFoundPage,
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
