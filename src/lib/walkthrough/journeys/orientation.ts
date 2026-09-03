import type { JourneyDefinition } from "../types";
import { registerJourney } from "./index";

const journey: JourneyDefinition = {
  id: "orientation",
  title: "Welcome to JANJEZ",
  description: "A quick tour to get you oriented with the platform.",
  version: 1,
  steps: [
    {
      id: "orient-home",
      journeyId: "orientation",
      title: "Welcome to JANJEZ",
      description: "Your one-stop shop for instant social clout across all major platforms. Everything you need is right here.",
      target: "walkthrough-home",
      placement: "bottom",
      route: "/",
      nextBehaviour: "auto",
    },
    {
      id: "orient-nav-services",
      journeyId: "orientation",
      title: "Browse Services",
      description: "Explore our full catalogue of services for YouTube, Instagram, Facebook, TikTok, Telegram, WhatsApp, Snapchat, LinkedIn, and X.",
      target: "walkthrough-nav-services",
      placement: "bottom",
      route: "/",
      nextBehaviour: "auto",
    },
    {
      id: "orient-nav-account",
      journeyId: "orientation",
      title: "Your Account",
      description: "Sign in to access your wallet, order history, and personalized recommendations.",
      target: "walkthrough-nav-account",
      placement: "bottom",
      route: "/",
      nextBehaviour: "auto",
    },
    {
      id: "orient-services",
      journeyId: "orientation",
      title: "Service Platform Categories",
      description: "Each platform offers tailored packages. Click any platform to see available services.",
      target: "walkthrough-service-catalog",
      placement: "bottom",
      route: "/services",
      nextBehaviour: "auto",
    },
    {
      id: "orient-complete",
      journeyId: "orientation",
      title: "You're All Set!",
      description: "That's the basics. Explore at your own pace, or start ordering below.",
      nextBehaviour: "manual",
    },
  ],
  allowSkip: true,
};

registerJourney(journey);
