import type { JourneyDefinition } from "../types";
import { registerJourney } from "./index";

const journey: JourneyDefinition = {
  id: "customer",
  title: "Authenticated Customer Tour",
  description: "For returning customers: manage orders, wallet, and notifications.",
  version: 1,
  steps: [
    {
      id: "cust-dashboard",
      journeyId: "customer",
      title: "Your Dashboard",
      description: "This is your hub for wallet balance, recent orders, and quick actions.",
      target: "walkthrough-dashboard",
      placement: "bottom",
      route: "/dashboard",
      condition: () => typeof window !== "undefined" && window.location.pathname === "/dashboard",
      nextBehaviour: "auto",
    },
    {
      id: "cust-wallet",
      journeyId: "customer",
      title: "Wallet & Payments",
      description: "Your wallet balance is shown here. Top up via M-Pesa or card when funds are low.",
      target: "walkthrough-wallet-balance",
      placement: "bottom",
      nextBehaviour: "auto",
    },
    {
      id: "cust-orders",
      journeyId: "customer",
      title: "Order History",
      description: "View past and current orders. Track delivery, request refills, or reorder easily.",
      target: "walkthrough-orders-link",
      placement: "left",
      nextBehaviour: "action",
      actionExpectation: "click",
    },
    {
      id: "cust-notifications",
      journeyId: "customer",
      title: "Notifications",
      description: "Stay informed about order status, payment confirmations, and platform updates.",
      target: "walkthrough-notif-bell",
      placement: "left",
      nextBehaviour: "auto",
    },
    {
      id: "cust-complete",
      journeyId: "customer",
      title: "All Set!",
      description: "You're all set. Use the sidebar to navigate anywhere.",
      nextBehaviour: "manual",
    },
  ],
  autoStart: false,
  allowSkip: true,
};

registerJourney(journey);
