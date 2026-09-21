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
  it("switches among three demographic-matched member profiles and avatars", async () => {
    const user = userEvent.setup();
    installDemoApi();
    render(<App />);

    expect(screen.getByRole("region", { name: /vera guide matched to jordan/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /current member jordan lee/i }));
    expect(screen.getByRole("menu", { name: /illustrative member profiles/i })).toBeInTheDocument();

    await user.click(screen.getByRole("menuitem", { name: /noor al mansouri/i }));
    expect(screen.getByText("Noor Al Mansouri")).toBeInTheDocument();
    expect(screen.getByText("38 · Woman")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /vera guide matched to noor/i })).toBeInTheDocument();
    expect(screen.getByText(/good afternoon, noor/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /current member noor al mansouri/i }));
    await user.click(screen.getByRole("menuitem", { name: /josh williams/i }));
    expect(screen.getByText("Josh Williams")).toBeInTheDocument();
    expect(screen.getByText("65 · Man")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /vera guide matched to josh/i })).toBeInTheDocument();
    expect(screen.getByText(/london, england/i)).toBeInTheDocument();
  });

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
    expect(screen.getByRole("heading", { name: /portfolio wellness/i })).toBeInTheDocument();
    expect(screen.getAllByText("$412K").length).toBeGreaterThan(0);
    expect(screen.getByText("$298K")).toBeInTheDocument();
  });

  it("lets a member opt in fitness devices and receive habit guidance", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/chat")) {
        return new Response(
          JSON.stringify({
            text: "Connect your phone or wearable. Vera uses weekly summaries only. You averaged 4,280 steps.",
            intent: "wellness-connect",
            planId: "wellness-connect",
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
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Link my fitness devices" }));
    expect(await screen.findByRole("heading", { name: /connect your phone and wearables/i }, { timeout: 2_500 })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /connect selected devices/i }));
    expect(screen.getAllByText(/12-minute walk after dinner/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/2 devices linked/i)).toBeInTheDocument();
  });

  it("fact-checks a health statement and shows the source", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/chat")) {
        return new Response(
          JSON.stringify({
            text: "That statement is completely false. Antibiotics do not treat the common cold. CDC antibiotic-use guidance is the source.",
            intent: "fact-check",
            mode: "demo",
            factCheck: {
              id: "antibiotics-cold",
              verdict: "false",
              claim: "Antibiotics treat the common cold or other viral illnesses.",
              finding: "Colds are caused by viruses. Antibiotics act on bacteria.",
              sources: [
                {
                  name: "Antibiotic Use",
                  organization: "Centers for Disease Control and Prevention",
                  detail: "Antibiotics do not work on viruses such as those that cause colds",
                },
              ],
            },
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
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Check a health claim" }));
    expect(await screen.findByRole("article", { name: /health statement fact check/i }, { timeout: 2_500 })).toBeInTheDocument();
    expect(screen.getAllByText(/completely false/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Centers for Disease Control and Prevention")).toBeInTheDocument();
  });

  it("pre-registers the closest hospital and lists alternatives", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/chat")) {
        return new Response(
          JSON.stringify({
            text: "Hartford Hospital Outpatient Pavilion is 11 minutes away. Typical timing is 18 minutes to check in and 5–7 days to full recovery.",
            intent: "hospital-prereg",
            planId: "hospital-prereg",
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
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Find the right hospital" }));
    expect(await screen.findByRole("heading", { name: /pre-register at the closest ready facility/i }, { timeout: 2_500 })).toBeInTheDocument();
    expect(screen.getByText(/saint francis hospital/i)).toBeInTheDocument();
    expect(screen.getByText(/photo id and member id card/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /pre-register and notify the hospital/i }));
    expect(screen.getByText(/pre-registration is queued/i)).toBeInTheDocument();
    expect(screen.getByText(/Bloomfield, CT · IP/i)).toBeInTheDocument();
  });
});
