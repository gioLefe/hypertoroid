import js from "@eslint/js";
import tseslint from "typescript-eslint";

const SRC_FILES = ["src/**/*.{ts,tsx,js,jsx}"];

const warnifyRules = (rules = {}) =>
  Object.fromEntries(
    Object.entries(rules).map(([ruleName, ruleValue]) => {
      if (Array.isArray(ruleValue)) {
        // [severity, ...options]
        return [ruleName, ["warn", ...ruleValue.slice(1)]];
      }
      // "off" | "warn" | "error" | 0 | 1 | 2
      return [ruleName, "warn"];
    })
  );

const scopedWarnConfig = (cfg) => {
  const { rules, ...rest } = cfg ?? {};
  return {
    ...rest,
    files: SRC_FILES,
    rules: warnifyRules(rules),
  };
};

// Hypertoroid linting is intentionally minimal by default:
// - hard errors only for rules that protect consumers (e.g. self-imports)
// - optionally enable broader "recommended" rules as warnings via env flag
const enableRecommendedWarnings = process.env.ESLINT_RECOMMENDED === "1";

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  {
    files: ["src/**/*.{ts,tsx}"] ,
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      // Prevent importing this package by its own name from inside the repo.
      // Self-imports can cause duplicated types (src vs dist) in consumers.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "hypertoroid",
              message:
                "Do not self-import 'hypertoroid' from within the hypertoroid repo. Use a relative import.",
            },
          ],
          patterns: [
            {
              group: ["hypertoroid/*"],
              message:
                "Do not self-import 'hypertoroid/*' from within the hypertoroid repo. Use a relative import.",
            },
          ],
        },
      ],
    },
  },

  ...(enableRecommendedWarnings
    ? [
        // JS recommended rules (warnings only)
        scopedWarnConfig(js.configs.recommended),
        // TS recommended rules (warnings only)
        ...tseslint.configs.recommended.map(scopedWarnConfig),
      ]
    : []),
];
