# Scrape a domain that is supported
scrape scraper domain:
    @cd ../scripts && bun scrape.ts {{scraper}} {{domain}}

scrape-grailed:
    @just scrape::scrape "grailed" "https://www.grailed.com/collections/289"

scrape-ssense:
    @just scrape::scrape "ssense" "https://www.ssense.com/en-ca/men/clothing"