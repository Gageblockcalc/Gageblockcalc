/**
 * Machinist Hub links for the Gage Block Calculator.
 * The calculator works the same if this file is missing or every value is empty.
 */
(function (global) {
  global.GageBlockHubConfig = {
    /**
     * Machinist Hub base URL (no trailing slash). The ONE place the hub address lives.
     * Hub lives at askmachinist.com (Nick's domain, 2026-10-10).
     * Change this one line if the hub ever moves.
     */
    hubUrl: 'https://askmachinist.com',

    /** Visitor counter endpoint (gageblockcalc-chat worker). Empty string = no counter. */
    counterUrl: 'https://gageblockcalc-chat.tekjeep.workers.dev',

    /** Buy Me a Coffee page (https://buymeacoffee.com/... or https://coff.ee/...). Hidden while empty. */
    bmcUrl: 'https://buymeacoffee.com/tekjeep',
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
