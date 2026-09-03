import type { JourneyDefinition } from "./types";

export const journeys: Record<string, JourneyDefinition> = {};

export function registerJourney(journey: JourneyDefinition): void {
  journeys[journey.id] = journey;
}

export function getJourney(id: string): JourneyDefinition | undefined {
  return journeys[id];
}

export function getAllJourneyIds(): string[] {
  return Object.keys(journeys);
}
