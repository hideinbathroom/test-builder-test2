# Real-Time Stock Trading Volume Dashboard

## Overview

This project is a real-time stock trading volume dashboard that displays the top trading volume stocks for KOSPI and KOSDAQ. It now includes a real-time news feed fetched via a Cloudflare Function, along with market indicators and popular search keywords.

## Features

*   **Real-Time Data:** Displays real-time stock data, which is currently mocked but can be connected to a real API.
*   **KOSPI & KOSDAQ:** Shows the top trading volume stocks for both KOSPI and KOSDAQ markets.
*   **Market Indicators:** Displays key market indicators like KOSPI and KOSDAQ indexes, exchange rates, and total trading volume.
*   **Real-Time News:** Fetches and displays the latest news from the GNews API via a Cloudflare Function, updating every minute.
*   **Popular Keywords:** Displays popular stock-related search keywords.
*   **Responsive Design:** The layout is responsive and works on smaller screens.

## File Structure

*   **`index.html`:** The main HTML structure of the dashboard, now linking to `main.js` for all JavaScript logic.
*   **`style.css`:** Contains the CSS styles for the dashboard.
*   **`main.js`:** Contains all the JavaScript logic for updating market data, news, and managing the countdown. It now fetches news from the `/get-news` endpoint.
*   **`functions/get-news.js`:** A Cloudflare Function responsible for securely fetching news articles from the GNews API.
*   **`.gitignore`:** Specifies intentionally untracked files to ignore, such as `firebase-debug.log`.

## Implementation Details

### Real-time News via Cloudflare Function

To provide real-time news, a Cloudflare Function (`functions/get-news.js`) has been implemented. This function acts as a proxy to the GNews API:

1.  **Secure API Key Handling**: The `GNEWS_API_KEY` is stored as a Cloudflare environment variable, preventing its exposure in client-side code.
2.  **Korean News**: The function fetches top headlines specifically for South Korea (`country=kr`, `lang=ko`).
3.  **Client-Side Integration**: `main.js` makes a `fetch` request to the `/get-news` endpoint (which maps to the Cloudflare Function) every minute.
4.  **Display**: The fetched news articles are then dynamically rendered into the `#newsContent` section of `index.html`. Each news item is clickable, opening the original article in a new tab.

**Action Required**: To make the real-time news feature fully functional, you must obtain a free API key from [GNews.io](https://gnews.io/) and configure it as an environment variable named `GNEWS_API_KEY` in your Cloudflare Pages project settings (under "Settings" > "Environment variables").
