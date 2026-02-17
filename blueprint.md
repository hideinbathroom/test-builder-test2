# Real-Time Stock Trading Volume Dashboard

## Overview

This project is a real-time stock trading volume dashboard that displays the top trading volume stocks for KOSPI and KOSDAQ. It now includes a real-time news feed, market indicators, top stocks, and popular search keywords, all fetched via Cloudflare Functions and updated every 1 hour.

## Features

*   **Real-Time Data:** Displays real-time stock data fetched from public sources (Naver Finance for market data and top stocks, GNews API for news) via Cloudflare Functions.
*   **KOSPI & KOSDAQ Top Stocks:** Shows the top trading volume stocks for both KOSPI and KOSDAQ markets.
*   **Market Indicators:** Displays key market indicators like KOSPI and KOSDAQ indexes, exchange rates.
*   **Real-Time News:** Fetches and displays the latest news from the GNews API via a Cloudflare Function.
*   **Popular Keywords:** Displays popular stock-related search keywords scraped from Naver Finance.
*   **Responsive Design:** The layout is responsive and works on smaller screens.
*   **1-Hour Update Interval:** All dynamic data on the page is updated every 1 hour.

## File Structure

*   **`index.html`:** The main HTML structure of the dashboard, linking to `main.js` for all JavaScript logic.
*   **`style.css`:** Contains the CSS styles for the dashboard.
*   **`main.js`:** Contains all the JavaScript logic for orchestrating updates of market data, top stocks, news, and managing the countdown. It fetches data from `/get-market-data`, `/get-top-stocks`, and `/get-news` endpoints.
*   **`package.json`:** Defines project dependencies, including `node-html-parser` for web scraping within Cloudflare Functions.
*   **`functions/get-news.js`:** A Cloudflare Function responsible for securely fetching news articles from the GNews API.
*   **`functions/get-market-data.js`:** A Cloudflare Function responsible for scraping KOSPI/KOSDAQ indexes, exchange rate, and hot keywords from Naver Finance.
*   **`functions/get-top-stocks.js`:** A Cloudflare Function responsible for scraping top trading volume stocks for KOSPI and KOSDAQ from Naver Finance.
*   **`.gitignore`:** Specifies intentionally untracked files to ignore, such as `firebase-debug.log`.

## Implementation Details

### Real-time Data via Cloudflare Functions (Updated to 1-hour interval)

All real-time data on the dashboard is now fetched via dedicated Cloudflare Functions, ensuring both security and efficient data retrieval. The update interval for all data has been standardized to **1 hour**.

1.  **Market Indicators & Hot Keywords (`functions/get-market-data.js`)**:
    *   This function scrapes real-time KOSPI and KOSDAQ indices, exchange rates (USD/KRW), and popular search keywords directly from Naver Finance.
    *   Data is cached for 1 hour (`Cache-Control: max-age=3600`).
2.  **KOSPI & KOSDAQ Top Stocks (`functions/get-top-stocks.js`)**:
    *   This function scrapes the top 5 trading volume stocks for both KOSPI and KOSDAQ markets from Naver Finance.
    *   Data is cached for 1 hour (`Cache-Control: max-age=3600`).
3.  **Real-time News (`functions/get-news.js`)**:
    *   This function acts as a secure proxy to the GNews API, fetching top headlines for South Korea.
    *   Data is cached for 1 hour (`Cache-Control: max-age=3600`).

**Client-Side Orchestration (`main.js`)**:
*   The `main.js` script coordinates calls to these three Cloudflare Function endpoints every 1 hour (`setInterval(updateData, 3600000)`).
*   It dynamically updates the corresponding sections of `index.html` with the fetched data.
*   A countdown timer visualizes the time remaining until the next update.

**Action Required**: To make the real-time news feature fully functional, you must obtain a free API key from [GNews.io](https://gnews.io/) and configure it as an environment variable named `GNEWS_API_KEY` in your Cloudflare Pages project settings (under "Settings" > "Environment variables").
