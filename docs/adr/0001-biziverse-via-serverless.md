# Proxy Biziverse setLead through a Vercel function

The site is static HTML on Vercel. Biziverse Premium `setLead` needs an API key that must not ship to the browser. We send Inquiry payloads from the page to a serverless function; the function holds `BIZIVERSE_API_KEY` in the environment and POSTs to Biziverse.

**Considered options:** call Biziverse from the browser (key leaks); a third-party form backend (another vendor, still need field mapping). **Consequence:** local `index.html` file-open will not create Leads until the function is reachable.
