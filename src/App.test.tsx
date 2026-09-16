import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

function installDemoApi() {
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith("/api/chat")) {
      return new Response(
        JSON.stringify({
          text: "A 90-day home-delivery fill keeps the medication the same and lowers your estimated annual cost by $312.",
          intent: "rx-savings",
          planId: "rx-savings",
          mode: "demo",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ available: false, reason: "not_configured" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("Vera judged experience", () => {
  it("takes a member from a suggested question to a completed value action", async () => {
    const user = userEvent.setup();
    const fetchMock = installDemoApi();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Lower my medication cost" }));

    expect(await screen.findByText(/lowers your estimated annual cost by \$312/i, {}, { timeout: 2_500 })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /switch to a 90-day home-delivery fill/i })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({ method: "POST" }),
    );

    await user.click(screen.getByRole("button", { name: /start the switch/i }));
    expect(screen.getByRole("button", { name: /started/i })).toBeDisabled();
    expect(screen.getByText(/prepared the switch request for your review/i)).toBeInTheDocument();
  });

  it("navigates to the business insight layer", async () => {
    const user = userEvent.setup();
    installDemoApi();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /friction intelligence/i }));

    expect(screen.getByRole("heading", { name: /see where value gets stuck/i })).toBeInTheDocument();
    expect(screen.getAllByText("$1.84M").length).toBeGreaterThan(0);
    expect(screen.getByText(/insights without surveillance/i)).toBeInTheDocument();
  });
});
