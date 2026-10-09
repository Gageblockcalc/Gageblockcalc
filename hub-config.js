/**
 * Machinist Hub links for the Gage Block Calculator.
 * The calculator works the same if this file is missing or every value is empty.
 */
(function (global) {
  global.GageBlockHubConfig = {
    /**
     * Machinist Hub base URL (no trailing slash). The ONE place the hub address lives.
     * Final address: 'https://app.gageblockcalc.com'. Using the Cloudflare Pages URL until
     * the app.gageblockcalc.com DNS record is live; then change this one line.
     */
    hubUrl: 'https://gageblockcalc-hub.pages.dev',

    /** Visitor counter endpoint (gageblockcalc-chat worker). Empty string = no counter. */
    counterUrl: 'https://gageblockcalc-chat.tekjeep.workers.dev',

    /** Buy Me a Coffee page (https://buymeacoffee.com/... or https://coff.ee/...). Hidden while empty. */
    bmcUrl: 'https://buymeacoffee.com/tekjeep',
  };
})(typeof globalThis !== 'undefined' ? globalThis : window);
