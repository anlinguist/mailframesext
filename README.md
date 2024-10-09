# Introduction
This extension offers 2 things:

1. In-browser support for MJML in a number of web-based email clients (such as gmail) and martech platforms (such as Klaviyo or Iterable).
2. AI generated MJML -> HTML.

## Development
To develop, modify files in /source, which is all typescript sources.

## Testing & Releasing
To generate a prod-ready version:
1. (Optionally) install bun.sh
2. Execute ```bun run build``` or ```npm run build```
3. A prod-ready chrome/ directory will appear (untracked by git). Sideload it into chrome.