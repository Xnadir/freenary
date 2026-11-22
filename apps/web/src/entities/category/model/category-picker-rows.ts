import {
  CATEGORY_GROUP_OF,
  categoriesForDirection,
} from "@freenary/api/lib/taxonomy";
import type {
  SpendingCategory,
  TransactionDirection,
} from "@freenary/api/lib/taxonomy";

import type { CategoryRow } from "./category-search";
import { categoryRowMatches } from "./category-search";
import { categoryGroupLabel, categoryLabel } from "./taxonomy-labels";

const MATCH_PREFIX = "match:";

export interface CategoryPickerRow extends CategoryRow {
  category: SpendingCategory;
  isMatch: boolean;
  startsMatches: boolean;
}

const rowOf = (
  category: SpendingCategory,
  value: string,
  match: { isMatch: boolean; startsMatches: boolean }
): CategoryPickerRow => ({
  category,
  group: categoryGroupLabel(CATEGORY_GROUP_OF[category]),
  label: categoryLabel(category),
  value,
  ...match,
});

export const categoryPickerRows = (
  direction: TransactionDirection
): CategoryPickerRow[] =>
  categoriesForDirection(direction).map((category) =>
    rowOf(category, category, { isMatch: false, startsMatches: false })
  );

export const withMatchRows = (
  rows: readonly CategoryPickerRow[],
  matches: readonly SpendingCategory[]
): readonly CategoryPickerRow[] => {
  const offered = matches.filter((category) =>
    rows.some((row) => row.category === category)
  );

  if (offered.length === 0) {
    return rows;
  }

  return [
    ...rows,
    ...offered.map((category, index) =>
      rowOf(category, `${MATCH_PREFIX}${category}`, {
        isMatch: true,
        startsMatches: index === 0,
      })
    ),
  ];
};

export const categoryPickerRowMatches = (
  row: CategoryPickerRow,
  query: string
): boolean => row.isMatch || categoryRowMatches(row, query);

export const pickedCategory = (
  rows: readonly CategoryPickerRow[],
  value: string
): SpendingCategory | undefined =>
  rows.find((row) => row.value === value)?.category;
