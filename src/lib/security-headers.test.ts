import { readFileSync } from "node:fs";
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
        "Permissions-Policy": "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
      },
    );
  });

  it("allows only Google Maps embeds while denying framing of this site and plugins", () => {
    const csp = securityHeaders.find(({ key }) => key === "Content-Security-Policy")?.value;

    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("frame-src https://www.google.com");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("script-src-attr 'none'");
    expect(csp).not.toContain("cyberjapandata.gsi.go.jp");
    expect(csp).toContain("connect-src 'self'");
  });

  it("keeps Vercel and Docker response headers aligned", () => {
    const vercelConfig = JSON.parse(readFileSync("vercel.json", "utf8"));
    const vercelHeaders = Object.fromEntries(
      vercelConfig.headers[0].headers.map(({ key, value }: { key: string; value: string }) => [key, value]),
    );
    const nginxConfig = readFileSync("docker/nginx/default.conf", "utf8");

    for (const { key, value } of securityHeaders) {
      expect(vercelHeaders[key]).toBe(value);
      expect(nginxConfig).toContain(`add_header ${key} "${value}" always;`);
    }
  });
});
