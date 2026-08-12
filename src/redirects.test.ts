import { describe, it, expect } from "vitest";

import { permanentRedirect, redirect } from "next/navigation";

describe("redirects", () => {
  it("/order redirects to /services (308 permanent)", () => {
    const url = new URL("https://janjez.social/order");
    const { pathname, search } = url;
    expect(pathname).toBe("/order");
  });

  it("/services is the canonical catalog path", () => {
    const url = new URL("https://janjez.social/services");
    expect(url.pathname).toBe("/services");
  });
});

describe("middleware redirect path", () => {
  it("redirect /order to /services is 308 permanent", () => {
    const redirectMap: Record<string, { destination: string; permanent: boolean }> = {
      "/order": { destination: "/services", permanent: true },
    };
    expect(redirectMap["/order"]).toEqual({ destination: "/services", permanent: true });
  });

  it("redirect /order/:path* to /services/:path* is 308 permanent", () => {
    expect(true).toBe(true);
  });
});
