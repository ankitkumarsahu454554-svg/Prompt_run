"use client";

import * as React from "react";
import { CATEGORIES } from "../../../domain/constants";
import type { ExpenseCategory } from "../../../domain/types";

interface CategoryRadioGroupProps {
  category: ExpenseCategory;
  setCategory: (c: ExpenseCategory) => void;
}

export const CategoryRadioGroup: React.FC<CategoryRadioGroupProps> = ({
  category,
  setCategory,
}) => {
  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-text" id="category-label">
        Category
      </span>
      <div
        role="radiogroup"
        aria-labelledby="category-label"
        className="grid grid-cols-3 sm:grid-cols-4 gap-2"
      >
        {CATEGORIES.map((cat) => {
          const isSelected = category === cat;
          return (
            <button
              key={cat}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setCategory(cat)}
              className={`min-h-[44px] px-3 py-2 rounded-input text-xs font-medium border transition-colors flex items-center justify-center select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text ${
                isSelected
                  ? "bg-primary text-white border-primary shadow-xs font-semibold"
                  : "bg-elevated text-muted border-border hover:text-text hover:bg-surface"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
