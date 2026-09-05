import { describe, expect, it } from "vitest";
import { securityHeaders } from "@/lib/security-headers";

describe("securityHeaders", () => {
  it("sets baseline browser security policies", () => {
    expect(Object.fromEntries(securityHeaders.map(({ key, value }) => [key, value]))).toMatchObject(
      {
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Cross-Origin-Opener-Policy": "same-origin",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
      },
    );
  });

  it("allows required map resources while denying framing and plugins", () => {
    const csp = securityHeaders.find(({ key }) => key === "Content-Security-Policy")?.value;

    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("script-src-attr 'none'");
    expect(csp).toContain("https://cyberjapandata.gsi.go.jp");
    expect(csp).toContain("worker-src 'self' blob:");
  });
});
