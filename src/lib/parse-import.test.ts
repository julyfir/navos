import { describe, it, expect } from "vitest";
import { parseImportText } from "./parse-import";

describe("parseImportText", () => {
  it("无协议时自动补 https", () => {
    const out = parseImportText("example.com");
    expect(out[0].url).toBe("https://example.com/");
  });
  it("去重同域", () => {
    const out = parseImportText("a.com\nhttps://a.com/x");
    expect(out).toHaveLength(1);
  });
  it("过滤无效行", () => {
    const out = parseImportText("not a url\n\nfoo.bar");
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe("foo.bar");
  });
  it("标题去掉 www", () => {
    const out = parseImportText("www.github.com");
    expect(out[0].title).toBe("github.com");
  });
});