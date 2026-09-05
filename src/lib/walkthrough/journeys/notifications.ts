import type { JourneyDefinition } from "../types";
import { registerJourney } from "./index";

const journey: JourneyDefinition = {
  id: "notifications",
  title: "Notifications Guide",
  description: "How to use the notifications system.",
  version: 1,
  steps: [
    {
      id: "notif-bell",
      journeyId: "notifications",
      title: "Notification Bell",
      description: "The bell icon shows unread notifications. Click it to open the panel.",
      target: "walkthrough-notif-bell",
      placement: "bottom",
      nextBehaviour: "action",
      actionExpectation: "click",
    },
    {
      id: "notif-panel",
      journeyId: "notifications",
      title: "Notification Panel",
      description: "Recent notifications appear here. Unread items are highlighted.",
      target: "walkthrough-notif-panel",
      placement: "right",
      nextBehaviour: "auto",
    },
    {
      id: "notif-view-all",
      journeyId: "notifications",
      title: "View All Notifications",
      description: "Click to open the full notification center with all your notifications.",
      target: "walkthrough-view-all-notifications",
      placement: "left",
      nextBehaviour: "action",
      actionExpectation: "click",
      condition: () => typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard"),
    },
    {
      id: "notif-complete",
      journeyId: "notifications",
      title: "That's All!",
      description: "You can return to notifications anytime by clicking the bell icon.",
      nextBehaviour: "manual",
    },
  ],
  autoStart: false,
  allowSkip: true,
};

registerJourney(journey);
