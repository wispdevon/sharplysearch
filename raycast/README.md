# Sharply Search for Raycast

Search the bundled Sharply photography catalog, inspect live specifications, copy
individual values, and open the complete gear page from Raycast on macOS.

## Development installation

1. Install [Raycast](https://www.raycast.com/) and Node.js 22 or newer.
2. In this directory, run `npm install && npm run dev`.
3. Enter a `sharply_live_…` developer key when Raycast opens the extension preferences.
4. Run **Search Sharply Gear** from Raycast and optionally assign it a hotkey.

The catalog search is entirely local. Selecting an item requests its current
specifications from Sharply. The specification-label registry is cached by Raycast;
gear values remain live.
