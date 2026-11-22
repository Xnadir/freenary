import { describe, expect, it } from "bun:test";

import { categoriesForDirection } from "@freenary/api/lib/taxonomy";

import {
  categoryPickerRowMatches,
  categoryPickerRows,
  pickedCategory,
  withMatchRows,
} from "./category-picker-rows";

const outgoing = categoryPickerRows("outgoing");

describe("categoryPickerRows", () => {
  it("lists only the direction's categories", () => {
    expect(outgoing.map((row) => row.value)).toEqual([
      ...categoriesForDirection("outgoing"),
    ]);

    expect(outgoing.some((row) => row.isMatch)).toBe(false);
  });
});

describe("withMatchRows", () => {
  it("keeps the same rows when nothing matches", () => {
    expect(withMatchRows(outgoing, [])).toBe(outgoing);
  });

  it("keeps every category row itself, so the selection stays put", () => {
    const rows = withMatchRows(outgoing, ["groceries"]);

    expect(rows.slice(0, outgoing.length)).toEqual(outgoing);

    for (const [index, row] of outgoing.entries()) {
      expect(rows[index]).toBe(row);
    }
  });

  it("appends the matches after the categories, flagging the first", () => {
    const matches = withMatchRows(outgoing, ["groceries", "shopping"]).slice(
      outgoing.length
    );

    expect(matches.map((row) => row.category)).toEqual([
      "groceries",
      "shopping",
    ]);

    expect(matches.map((row) => row.startsMatches)).toEqual([true, false]);
  });

  it("drops matches the direction cannot take", () => {
    const rows = withMatchRows(outgoing, ["salary", "groceries"]);

    expect(rows.flatMap((row) => (row.isMatch ? [row.category] : []))).toEqual([
      "groceries",
    ]);
  });

  it("keeps the matches whatever is typed", () => {
    const kept = withMatchRows(outgoing, ["groceries"]).filter((row) =>
      categoryPickerRowMatches(row, "carrefour")
    );

    expect(kept.map((row) => row.value)).toEqual(["match:groceries"]);
  });

  it("selects the same category from its row or its match", () => {
    const rows = withMatchRows(outgoing, ["groceries"]);

    expect(pickedCategory(rows, "groceries")).toBe("groceries");
    expect(pickedCategory(rows, "match:groceries")).toBe("groceries");
    expect(pickedCategory(rows, "")).toBeUndefined();
  });
});
