import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout.jsx";
import { AttendeeLayout } from "../layouts/AttendeeLayout.jsx";
import { OrganizerLayout } from "../layouts/OrganizerLayout.jsx";
import { ProtectedRoute } from "../components/layout/ProtectedRoute.jsx";

// Public Pages
import { LandingPage } from "../pages/public/LandingPage.jsx";
import { EventsPage } from "../pages/public/EventsPage.jsx";
import { EventDetailsPage } from "../pages/public/EventDetailsPage.jsx";
import { LoginPage } from "../pages/auth/LoginPage.jsx";
import { SignupPage } from "../pages/auth/SignupPage.jsx";
import { PaymentCallbackPage } from "../pages/public/PaymentCallbackPage.jsx";

// Attendee Pages
import { AttendeeDashboard } from "../pages/attendee/AttendeeDashboard.jsx";
import { MyRegistrationsPage } from "../pages/attendee/MyRegistrationsPage.jsx";
import { NotificationsPage } from "../pages/attendee/NotificationsPage.jsx";
import { ProfilePage } from "../pages/attendee/ProfilePage.jsx";

// Organizer Pages
import { OrganizerOverview } from "../pages/organizer/OrganizerOverview.jsx";
import { MyEventsPage } from "../pages/organizer/MyEventsPage.jsx";
import { EventEditorPage } from "../pages/organizer/EventEditorPage.jsx";
import { OrganizerRegistrationsPage } from "../pages/organizer/OrganizerRegistrationsPage.jsx";
import { OrganizerWaitlistPage } from "../pages/organizer/OrganizerWaitlistPage.jsx";
import { OrganizerAnalyticsPage } from "../pages/organizer/OrganizerAnalyticsPage.jsx";

export const router = createBrowserRouter([
  // Public Routes
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
      },
      {
        path: "payment/success",
        element: <PaymentCallbackPage status="success" />
      },
      {
        path: "payment/failed",
        element: <PaymentCallbackPage status="failure" />
      }
    ]
  },

  // Attendee Protected Routes
  {
    path: "/app",
    element: <ProtectedRoute allowedRoles={["ATTENDEE", "ADMIN"]} />,
    children: [
      {
        element: <AttendeeLayout />,
        children: [
          {
            index: true,
            element: <AttendeeDashboard />
          },
          {
            path: "registrations",
            element: <MyRegistrationsPage />
          },
          {
            path: "notifications",
            element: <NotificationsPage />
          },
          {
            path: "profile",
            element: <ProfilePage />
          }
        ]
      }
    ]
  },

  // Organizer Protected Routes
  {
    path: "/organizer",
    element: <ProtectedRoute allowedRoles={["ORGANIZER", "ADMIN"]} />,
    children: [
      {
        element: <OrganizerLayout />,
        children: [
          {
            index: true,
            element: <OrganizerOverview />
          },
          {
            path: "events",
            element: <MyEventsPage />
          },
          {
            path: "events/new",
            element: <EventEditorPage />
          },
          {
            path: "events/:eventId/edit",
            element: <EventEditorPage />
          },
          {
            path: "registrations",
            element: <OrganizerRegistrationsPage />
          },
          {
            path: "waitlist",
            element: <OrganizerWaitlistPage />
          },
          {
            path: "analytics",
            element: <OrganizerAnalyticsPage />
          },
          {
            path: "notifications",
            element: <NotificationsPage />
          },
          {
            path: "profile",
            element: <ProfilePage />
          }
        ]
      }
    ]
  },

  // Catch-all
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);
