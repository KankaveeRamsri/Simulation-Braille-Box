/**
 * The single set of top-level sections the app can be showing. Shared by
 * the main navigation and the guided tour so both drive the exact same
 * state — there is no separate "tour view" vs "explore view" rendering
 * path, only this one viewMode plus a tourActive flag layered on top.
 */
export type ViewMode = "overview" | "device" | "hardware3d" | "actuator" | "impact" | "standard";
