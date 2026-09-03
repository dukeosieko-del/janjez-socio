import type { JourneyDefinition } from "../types";
import { registerJourney } from "./index";

const journey: JourneyDefinition = {
  id: "blog",
  title: "Blog & Community Guide",
  description: "Explore our blog for tutorials, tips, and the latest platform updates.",
  version: 1,
  autoStart: false,
  steps: [
    {
      id: "blog-start",
      journeyId: "blog",
      title: "Blog & Community",
      description: "Stay updated with the latest SMM tips, platform news, and growth strategies.",
      target: "walkthrough-blog-entry",
      placement: "bottom",
      route: "/blog",
      nextBehaviour: "auto",
    },
    {
      id: "blog-read",
      journeyId: "blog",
      title: "Reading Articles",
      description: "Click any article to read the full guide. Articles are categorized for easy browsing.",
      target: "walkthrough-blog-article",
      placement: "bottom",
      nextBehaviour: "auto",
    },
    {
      id: "blog-complete",
      journeyId: "blog",
      title: "Happy Reading!",
      description: "Bookmark articles you find useful. New content is added regularly.",
      nextBehaviour: "manual",
    },
  ],
  allowSkip: true,
};

registerJourney(journey);
