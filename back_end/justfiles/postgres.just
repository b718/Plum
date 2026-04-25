start-postgres:
    @cd ../docker/postgres/ && docker compose down && docker compose up -d
    @sleep 1
    @cd ".." && bunx --bun prisma migrate deploy
    @sleep 1
