# Scrape a domain that is supported
scrape scraper domain:
    @cd ../scripts && bun scrape.ts {{scraper}} {{domain}}

grailed:
    @just scrape::scrape "grailed" "https://www.grailed.com/collections/289"

ssense:
    @just scrape::scrape "ssense" "https://www.ssense.com/en-ca/men/clothing"

all:
    @just scrape::grailed
    @just scrape::ssense