import { describe, expect, it } from "vitest";
import { readPrivateMutation } from "@/lib/http/json";
import { parsePage } from "@/lib/http/pagination";

const origin = new URL(process.env.AUTH_URL!).origin;
function request(body: string, headers: Record<string, string> = {}) {
  return new Request(`${origin}/api/account`, { method: "POST", body, headers: { origin, "content-type": "application/json", ...headers } });
}
describe("private mutations", () => {
  it("rejects foreign origins and cross-site requests", async () => {
    await expect(readPrivateMutation(request("{}", { origin: "https://other.example" }))).rejects.toMatchObject({ status: 403 });
    await expect(readPrivateMutation(request("{}", { "sec-fetch-site": "cross-site" }))).rejects.toMatchObject({ status: 403 });
  });
  it("requires the exact JSON media type while allowing charset parameters", async () => {
    await expect(readPrivateMutation(request("{}", { "content-type": "application/jsonp" }))).rejects.toMatchObject({ status: 415 });
    await expect(readPrivateMutation(request('{"ok":true}', { "content-type": "application/json; charset=utf-8" }))).resolves.toEqual({ ok: true });
  });
  it("limits actual bytes even when content-length is absent or false", async () => {
    await expect(readPrivateMutation(request('"ääää"'), 8)).rejects.toMatchObject({ status: 413 });
    await expect(readPrivateMutation(request('"ääää"', { "content-length": "1" }), 8)).rejects.toMatchObject({ status: 413 });
    await expect(readPrivateMutation(request("{}", { "content-length": "100" }), 8)).rejects.toMatchObject({ status: 413 });
  });
  it("returns a client error for malformed JSON", async () => {
    await expect(readPrivateMutation(request("{"))).rejects.toMatchObject({ code: "INPUT" });
  });
});
it("bounds pagination and handles repeated query values", () => {
  for (const input of [undefined, ["2", "3"], "Infinity", "-1", "1.5", "NaN"]) expect(parsePage(input)).toBe(1);
  expect(parsePage("999999999999999999999")).toBe(10000);
  expect(parsePage("2")).toBe(2);
});
