import type {
  SpendingCategory,
  TransactionDirection,
} from "@freenary/api/lib/taxonomy";
import { useQuery } from "@tanstack/react-query";

import { useDebouncedValue } from "@/shared/lib/use-debounced-value";

import {
  categorySuggestionStatusQueryOptions,
  categorySuggestionsQueryOptions,
} from "../api/category-suggestion-queries";

export const SUGGESTION_DEBOUNCE_MS = 300;

const MIN_SUGGESTION_QUERY_LENGTH = 2;

const NO_SUGGESTIONS: readonly SpendingCategory[] = [];

export interface CategorySuggestions {
  categories: readonly SpendingCategory[];
  isSearching: boolean;
}

export const useCategorySuggestions = ({
  currency,
  direction,
  open,
  query,
}: {
  currency?: string;
  direction: TransactionDirection;
  open: boolean;
  query: string;
}): CategorySuggestions => {
  const status = useQuery({
    ...categorySuggestionStatusQueryOptions(),
    enabled: open,
  });

  const typed = query.trim();
  const debounced = useDebouncedValue(typed, SUGGESTION_DEBOUNCE_MS);
  const asks =
    open &&
    status.data?.enabled === true &&
    typed.length >= MIN_SUGGESTION_QUERY_LENGTH;

  const suggestions = useQuery({
    ...categorySuggestionsQueryOptions({
      currency,
      direction,
      query: debounced,
    }),
    enabled: asks && debounced === typed,
  });

  if (!asks) {
    return { categories: NO_SUGGESTIONS, isSearching: false };
  }

  return {
    categories:
      debounced === typed
        ? (suggestions.data?.categories ?? NO_SUGGESTIONS)
        : NO_SUGGESTIONS,
    isSearching: debounced !== typed || suggestions.isFetching,
  };
};
