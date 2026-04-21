### Scraper For Product Data

The goal of this project is to make commerce easier, however, if there isn't any product data to match the user query to what good is this for the user? This is where Scraper comes in. Scraper defines the interface while concrete implementations — ScraperSsense, ScraperHaven, ScraperLivestock, etc. — inherit from this interface and encapsulate all site-specific scraping logic. The flow will look something like the diagram below. Scrapers are triggered asynchronously via a job queue. A job is enqueued with a target retailer; a worker picks it up, runs the appropriate scraper, and hands the result to the downstream pipeline. The flow will look something like the diagrams below.

#### Inheritance / Plugin Pattern

```
                   ┌─────────────────────────────────┐
                   │            Scraper              │  ← interface / base contract
                   └──────────────┬──────────────────┘
                                  │
                    ┌─────────────┴─────────────────┐
                    │                               │
       ┌────────────▼────────────┐   ┌──────────────▼────────────┐
       │       ScraperUrl        │   │    ScraperProductData     │
       └──────┬──────────┬───────┘   └──────┬──────────┬─────────┘
              │          │                  │          │
   ┌──────────▼──┐  ┌────▼───────┐  ┌───────▼─────┐  ┌─▼───────────────┐
   │ScraperUrlS… │  │ScraperUrl… │  │ScraperProd… │  │ScraperProd…     │
   │  sense      │  │  Haven     │  │  DataSsense │  │  DataHaven      │
   └─────────────┘  └────────────┘  └─────────────┘  └─────────────────┘
```

#### Data Pipeline

```
┌─────────────────────────────────┐
│     Trigger Scraper             │  ← enqueue job with target retailer
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│     Scrape URLs                 │  ← ScraperUrl fetches all product URLs from domain
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│     Scrape & Transform          │  ← ScraperProductData fetches each URL and normalises to Product shape
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│     Embed Data                  │  ← convert product text to vector
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│     Upload Data                 │  ← upsert vectors + metadata into vector database
└─────────────────────────────────┘
```
