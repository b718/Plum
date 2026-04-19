start-database:
    @cd ../docker/database/ && docker compose down && docker compose up -d
