import type { Route } from "../core/create-router.js";
import { appTitle } from "../shared/global.js";

export const routes: Route[] = [
  {
    load: async () => import("./home-page.component.js").then((m) => m.tagName),
    menu: { href: "/", label: "Home" },
    pattern: new URLPattern({ pathname: "/" }),
    title: appTitle,
  },
  {
    load: async () => import("./about-page.component.js").then((m) => m.tagName),
    menu: { href: "/about", label: "About" },
    pattern: new URLPattern({ pathname: "/about" }),
    title: `About — ${appTitle}`,
  },
  {
    load: async () => import("./booking-form-page.component.js").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/bookings/new" }),
    title: `Create booking — ${appTitle}`,
  },
  {
    load: async () => import("./bookings-page.component.js").then((m) => m.tagName),
    menu: { href: "/bookings", label: "Bookings" },
    pattern: new URLPattern({ pathname: "/bookings" }),
    title: `Bookings — ${appTitle}`,
  },
  {
    load: async () => import("./launch-form-page.component.js").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/launches/new" }),
    title: `Schedule launch — ${appTitle}`,
  },
  {
    load: async () => import("./launch-form-page.component.js").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/launches/:launchId/edit" }),
    title: `Edit launch — ${appTitle}`,
  },
  {
    load: async () => import("./launch-scheduler-page.component.js").then((m) => m.tagName),
    menu: { href: "/launches", label: "Launches" },
    pattern: new URLPattern({ pathname: "/launches" }),
    title: `Launch Scheduler — ${appTitle}`,
  },
  {
    load: async () => import("./rocket-form-page.component.js").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/rockets/new" }),
    title: `Add rocket — ${appTitle}`,
  },
  {
    load: async () => import("./rocket-form-page.component.js").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/rockets/:rocketId/edit" }),
    title: `Edit rocket — ${appTitle}`,
  },
  {
    load: async () => import("./item-detail-page.component.js").then((m) => m.tagName),
    pattern: new URLPattern({ pathname: "/items/:itemId" }),
    title: "Item — Details",
  },
];

export const menuLinks = routes.flatMap((route) => (route.menu ? [route.menu] : []));

export const notFoundRoute: Route = {
  load: async () => import("./not-found-page.component.js").then((m) => m.tagName),
  pattern: new URLPattern({ pathname: "*" }),
  title: "Not found ",
};
