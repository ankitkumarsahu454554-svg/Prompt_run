/**
 * @file format.ts
 * Screen-reader friendly and visual formatting for Indian Rupees (en-IN).
 */

import { paiseToRupees, type Paise } from "../domain/money";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const wholeCurrencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("en-IN");

/**
 * Formats integer Paise as Indian Rupee string with symbol (e.g. "₹10,000" or "₹312.50").
 */
export function formatPaise(paise: Paise, showDecimals = false): string {
  const rupees = paiseToRupees(paise);
  if (!showDecimals && Number.isInteger(rupees)) {
    return wholeCurrencyFormatter.format(rupees);
  }
  return currencyFormatter.format(rupees);
}

/**
 * Formats integer Paise into pure numeric string with Indian comma grouping without ₹ symbol.
 */
export function formatPaiseNumber(paise: Paise): string {
  const rupees = paiseToRupees(paise);
  return numberFormatter.format(rupees);
}

/**
 * Returns a natural, screen-reader accessible representation of money.
 * E.g., "312 rupees" or "312 rupees 50 paise".
 */
export function formatSrMoney(paise: Paise): string {
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = Math.floor(absPaise / 100);
  const remainingPaise = absPaise % 100;

  let text = `${numberFormatter.format(rupees)} rupees`;
  if (remainingPaise > 0) {
    text += ` ${remainingPaise} paise`;
  }

  return isNegative ? `negative ${text}` : text;
}

/**
 * Formats a decimal ratio (0..1) as a percentage (e.g. "75%").
 */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
