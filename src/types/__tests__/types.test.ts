import { describe, it, expect } from "vitest";
import type { PageType, Breadcrumb, FormErrors } from "../types";

describe("Type Tests", () => {
  it("PageType should allow only specific strings", () => {
    // Valid assignments
    const p1: PageType = "list";
    const p2: PageType = "edit";
    const p3: PageType = "google-dicom-final";

    expect([p1, p2, p3]).toEqual(["list", "edit", "google-dicom-final"]);

    // @ts-expect-error: invalid PageType
    const p4: PageType = "invalid"; // TypeScript should error
  });

  it("Breadcrumb should allow label and optional href", () => {
    const b1: Breadcrumb = { label: "Home" };
    const b2: Breadcrumb = { label: "Dashboard", href: "/dashboard" };

    expect(b1.label).toBe("Home");
    expect(b2.href).toBe("/dashboard");

    // @ts-expect-error: missing label
    const b3: Breadcrumb = { href: "/no-label" };
  });

  it("FormErrors should accept any string keys with string values", () => {
    const errors: FormErrors = {
      username: "Required",
      password: "Too short",
    };

    expect(errors.username).toBe("Required");
    expect(errors.password).toBe("Too short");

    // @ts-expect-error: values must be string
    const errors2: FormErrors = { age: 123 };
  });
});
