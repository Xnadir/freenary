import { predefinedCategoryAppearance } from "@freenary/api/lib/categories";
import type {
  SpendingCategory,
  TransactionDirection,
} from "@freenary/api/lib/taxonomy";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@freenary/ui/components/combobox";
import { DropdownLabel } from "@freenary/ui/components/dropdown";
import { useMemo, useState } from "react";

import { m } from "@/paraglide/messages.js";

import {
  categoryPickerRowMatches,
  categoryPickerRows,
  pickedCategory,
  withMatchRows,
} from "../model/category-picker-rows";
import type { CategoryPickerRow } from "../model/category-picker-rows";
import { categoryLabel } from "../model/taxonomy-labels";
import { useCategorySuggestions } from "../model/use-category-suggestions";
import { categoryMenuIcon } from "./category-menu-icon";

interface SpendingCategoryPickerProps {
  className?: string;
  currency?: string;
  direction: TransactionDirection;
  onValueChange: (value: SpendingCategory) => void;
  value: SpendingCategory;
}

export const SpendingCategoryPicker = ({
  className,
  currency,
  direction,
  onValueChange,
  value,
}: SpendingCategoryPickerProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const typed = query.trim() === categoryLabel(value) ? "" : query;

  const suggestions = useCategorySuggestions({
    currency,
    direction,
    open,
    query: typed,
  });

  const rows = useMemo(() => categoryPickerRows(direction), [direction]);
  const items = useMemo(
    () => withMatchRows(rows, suggestions.categories),
    [rows, suggestions.categories]
  );

  return (
    <Combobox
      filter={categoryPickerRowMatches}
      items={items}
      onOpenChange={setOpen}
      onQueryChange={setQuery}
      onValueChange={(next) => {
        const category = pickedCategory(items, next);

        if (category !== undefined) {
          onValueChange(category);
        }
      }}
      value={value}
    >
      <ComboboxInput
        className={className}
        icon={categoryMenuIcon(predefinedCategoryAppearance(value))}
        placeholder={m.budget_category_search_placeholder()}
      />
      <ComboboxContent align="start">
        <ComboboxEmpty>
          {suggestions.isSearching
            ? m.budget_category_matches_searching()
            : m.budget_category_search_empty()}
        </ComboboxEmpty>
        <ComboboxList>
          {(item) => {
            // SAFETY: every row comes from `items`, built by categoryPickerRows.
            const row = item as CategoryPickerRow;

            return (
              <>
                {row.startsMatches ? (
                  <DropdownLabel aria-hidden className="mt-1">
                    {m.budget_category_matches_label()}
                  </DropdownLabel>
                ) : null}
                <ComboboxItem
                  icon={categoryMenuIcon(
                    predefinedCategoryAppearance(row.category)
                  )}
                  value={row.value}
                >
                  <span className="flex w-full items-baseline justify-between gap-3">
                    <span className="truncate">
                      {row.label}
                      {row.isMatch ? (
                        <span className="sr-only">
                          {m.budget_category_match_sr_suffix()}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-muted-foreground shrink-0 text-[11px]">
                      {row.group}
                    </span>
                  </span>
                </ComboboxItem>
              </>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
