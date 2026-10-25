import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout.jsx";
import { LandingPage } from "../pages/public/LandingPage.jsx";
import { EventsPage } from "../pages/public/EventsPage.jsx";
import { EventDetailsPage } from "../pages/public/EventDetailsPage.jsx";
import { LoginPage } from "../pages/auth/LoginPage.jsx";
import { SignupPage } from "../pages/auth/SignupPage.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />
      },
      {
        path: "events",
        element: <EventsPage />
      },
      {
        path: "events/:eventId",
        element: <EventDetailsPage />
      },
      {
        path: "login",
        element: <LoginPage />
      },
      {
        path: "signup",
        element: <SignupPage />
      }
    ]
  }
]);
