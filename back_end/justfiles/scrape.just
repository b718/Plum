# Scrape a domain that is supported
scrape domain:
    @cd ../scripts && bun scrape.ts {{domain}}

scrape-grailed:
    @just scrape::scrape "https://www.grailed.com/collections/289"

scrape-ssense:
    @just scrape::scrape "https://www.ssense.com/en-ca/men/clothing"