default:
    @just --list

# Create a new Bun package
create-package:
    @cd scripts && python3 create_package.py

# Start Plum
start:
    @mprocs

# Format Project
format:
    @bun run format
