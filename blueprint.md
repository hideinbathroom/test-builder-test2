# Real-Time Stock Market Dashboard

## Overview

This project is a real-time stock market dashboard that displays key market indicators for KOSPI and KOSDAQ, and a real-time news feed. To ensure stability and reliability, this project has been refactored to use professional financial data APIs instead of brittle web scraping methods. Data is fetched via Cloudflare Functions and updated every 1 hour.

## Features

*   **Reliable Real-Time Data:** Displays real-time market data fetched from the **Finnhub API** and news from the **GNews API** via Cloudflare Functions.
*   **Market Indicators:** Displays key market indicators like KOSPI (`^KS11`) and KOSDAQ (`^KQ11`) indexes and the USD/KRW exchange rate.
*   **Real-Time News:** Fetches and displays the latest financial news for South Korea.
*   **1-Hour Update Interval:** All dynamic data on the page is updated every 1 hour.
*   **Deprecated Features:** The 'Top Stocks' and 'Hot Keywords' features have been removed as they were based on unstable scraping methods and no reliable free API provides this data. The UI now displays a "Premium Feature" message in jejich place.
*   **Responsive Design:** The layout is responsive and works on smaller screens.

## File Structure

*   **`index.html`:** The main HTML structure of the dashboard.
*   **`style.css`:** All CSS styles for the dashboard.
*   **`main.js`:** Contains the JavaScript logic for fetching data from the Cloudflare Functions and updating the UI.
*   **`package.json`:** Defines project dependencies. It is now significantly simplified.
*   **`wrangler.toml`:** Configuration file for Cloudflare Pages. It enables Node.js compatibility mode.
*   **`functions/get-news.js`:** A Cloudflare Function that securely fetches news articles from the GNews API.
*   **`functions/get-market-data.js`:** A Cloudflare Function that securely fetches market index and forex data from the Finnhub API.
*   **`.gitignore`:** Specifies intentionally untracked files to ignore.

## Implementation Details

### API-First Architecture

To permanently resolve recurring data fetching and build errors, the project has been refactored away from web scraping to an API-first architecture.

1.  **Market Data (Finnhub API):**
    *   The `functions/get-market-data.js` function now connects to the professional Finnhub API.
    *   It fetches quote data for KOSPI (`^KS11`), KOSDAQ (`^KQ11`), and USD/KRW forex rates.
    *   This provides a stable, reliable, and correctly formatted (JSON) source of data, eliminating all previous encoding and 'N/A' errors.

2.  **News Data (GNews API):**
    *   The `functions/get-news.js` function remains, providing a stable source of news articles.

3.  **Frontend Simplification (`main.js`)**:
    *   The frontend logic has been streamlined to only request and render data from the reliable API sources.
    *   The 'Top Stocks' and 'Hot Keywords' sections now display a message informing the user that these are premium features, ensuring the UI is never in a broken state.

**Build & Deployment Configuration**:
*   **`wrangler.toml`**: The `nodejs_compat` compatibility flag is enabled to ensure the Cloudflare Functions environment can handle any Node.js APIs if required by dependencies.
*   **Cloudflare Pages Settings**: A build command (e.g., `npm install`) is required in the project's "Build & deployments" settings.

**Action Required: API Keys**

To make the application fully functional, you must obtain free API keys from the following services and configure them as environment variables in your Cloudflare Pages project settings:

1.  **`FINNHUB_API_KEY`**:
    *   Go to **[https://finnhub.io/](https://finnhub.io/)** and click "Get free API key".
    *   Set this key as an environment variable named `FINNHUB_API_KEY`.

2.  **`GNEWS_API_KEY`**:
    *   Go to **[https://gnews.io/](https://gnews.io/)** and click "Get Free API Key".
    *   Set this key as an environment variable named `GNEWS_API_KEY`.
