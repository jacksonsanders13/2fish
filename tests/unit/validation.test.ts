import { describe, expect, it } from "vitest";
import { needSchema, messageSchema, reportSchema } from "@/lib/validation/need";
import { signupSchema, safeNext } from "@/lib/validation/auth";
import { onboardingSchema } from "@/lib/validation/profile";
import { looksLikeAddress, safeUrl, formatDistance } from "@/lib/format";
import { checkText, hasProfanity, looksLikeSpam } from "@/lib/moderation";
import { lookupZip } from "@/lib/zips";

const goodNeed = {
  title: "Size 4 diapers",
  description: "Any brand works. Two boxes would get us through the month.",
  category: "baby",
  urgency: "high",
  fulfillment: "in_person",
  wishlistUrl: "",
};

describe("address guard", () => {
  it("catches street addresses", () => {
    expect(looksLikeAddress("Meet me at 412 Maple St")).toBe(true);
    expect(looksLikeAddress("1200 Six Forks Road apt 3")).toBe(true);
    expect(looksLikeAddress("drop at 55 w. oak avenue.")).toBe(true);
  });
  it("allows normal places", () => {
    expect(looksLikeAddress("North Regional Library lobby")).toBe(false);
    expect(looksLikeAddress("Food Lion on Capital Blvd")).toBe(false);
    expect(looksLikeAddress("size 4, two boxes")).toBe(false);
  });
});

describe("need schema", () => {
  it("accepts a normal need", () => {
    expect(needSchema.safeParse(goodNeed).success).toBe(true);
  });
  it("rejects an address in the description", () => {
    const r = needSchema.safeParse({ ...goodNeed, description: "Leave it on the porch at 123 Oak St please." });
    expect(r.success).toBe(false);
    expect(JSON.stringify(r.error?.issues)).toMatch(/street address/);
  });
  it("requires a wishlist link when wishlist is chosen", () => {
    const r = needSchema.safeParse({ ...goodNeed, fulfillment: "wishlist", wishlistUrl: "" });
    expect(r.success).toBe(false);
    expect(r.error?.issues[0].path).toEqual(["wishlistUrl"]);
  });
  it("rejects non-http wishlist links", () => {
    expect(needSchema.safeParse({ ...goodNeed, fulfillment: "both", wishlistUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(needSchema.safeParse({ ...goodNeed, fulfillment: "both", wishlistUrl: "https://www.amazon.com/hz/wishlist/ls/ABC" }).success).toBe(true);
  });
  it("rejects cash and crypto asks", () => {
    const r = needSchema.safeParse({ ...goodNeed, description: "Please venmo me $50 for rent, cashapp me works too." });
    expect(r.success).toBe(false);
  });
  it("rejects profanity", () => {
    expect(needSchema.safeParse({ ...goodNeed, title: "need some f*cking diapers" }).success).toBe(false);
  });
});

describe("moderation", () => {
  it("catches obfuscated profanity but not normal words", () => {
    expect(hasProfanity("this is sh1t")).toBe(true);
    expect(hasProfanity("we need a shirt and shoes")).toBe(false);
    expect(hasProfanity("classic assistance program")).toBe(false);
  });
  it("flags spam patterns", () => {
    expect(looksLikeSpam("http://a.com http://b.com http://c.com buy now")).toMatch(/links/);
    expect(looksLikeSpam("PLEASE HELP ME I NEED EVERYTHING RIGHT NOW THANKS")).toMatch(/caps/);
    expect(looksLikeSpam("Any brand works, thanks so much.")).toBeNull();
    expect(checkText("just a regular note")).toBeNull();
  });
});

describe("messages and reports", () => {
  it("validates message bodies", () => {
    expect(messageSchema.safeParse({ threadId: "11111111-1111-4111-8111-111111111111", body: "  " }).success).toBe(false);
    expect(messageSchema.safeParse({ threadId: "not-a-uuid", body: "hi" }).success).toBe(false);
    expect(messageSchema.safeParse({ threadId: "11111111-1111-4111-8111-111111111111", body: "Saturday at the library works" }).success).toBe(true);
  });
  it("requires a known report reason", () => {
    expect(reportSchema.safeParse({ targetType: "need", targetId: "11111111-1111-4111-8111-111111111111", reason: "spam" }).success).toBe(true);
    expect(reportSchema.safeParse({ targetType: "need", targetId: "11111111-1111-4111-8111-111111111111", reason: "meh" }).success).toBe(false);
  });
});

describe("auth", () => {
  it("requires the 18+ box on signup", () => {
    const base = { displayName: "Jess", email: "jess@example.com", password: "longenough1" };
    expect(signupSchema.safeParse({ ...base, over18: "on" }).success).toBe(true);
    expect(signupSchema.safeParse({ ...base }).success).toBe(false);
    expect(signupSchema.safeParse({ ...base, over18: "on", password: "short" }).success).toBe(false);
  });
  it("only redirects back into the site", () => {
    expect(safeNext("/needs/abc")).toBe("/needs/abc");
    expect(safeNext("https://evil.example")).toBe("/dashboard");
    expect(safeNext("//evil.example")).toBe("/dashboard");
    expect(safeNext(undefined, "/x")).toBe("/x");
  });
});

describe("onboarding and location", () => {
  it("needs a 5 digit zip and no address in the area", () => {
    expect(onboardingSchema.safeParse({ displayName: "Jess", zip: "27615", area: "North Raleigh" }).success).toBe(true);
    expect(onboardingSchema.safeParse({ displayName: "Jess", zip: "2761", area: "" }).success).toBe(false);
    expect(onboardingSchema.safeParse({ displayName: "Jess", zip: "27615", area: "412 Maple St" }).success).toBe(false);
  });
  it("turns a zip into a rounded point and nothing more precise", () => {
    const p = lookupZip("27615");
    expect(p).not.toBeNull();
    expect(Math.round(p!.lat * 100) / 100).toBe(p!.lat);
    expect(Math.round(p!.lng * 100) / 100).toBe(p!.lng);
    expect(lookupZip("00000")).toBeNull();
  });
  it("formats distances approximately", () => {
    expect(formatDistance(0.4)).toBe("under 1 mi away");
    expect(formatDistance(2.4)).toBe("~2 mi away");
    expect(formatDistance(null)).toBeNull();
  });
  it("only accepts http(s) urls", () => {
    expect(safeUrl("https://ok.example/x")).toBe("https://ok.example/x");
    expect(safeUrl("ftp://nope")).toBeNull();
    expect(safeUrl("not a url")).toBeNull();
  });
});
