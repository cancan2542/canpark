# canpark

Vehicle overnight travel blog with hazard-map context and field notes.

## Development

Run development and install commands inside Docker.

```sh
docker run --rm -v "$PWD":/app -w /app node:22-bookworm-slim corepack pnpm install
docker compose up app
docker compose run --rm app pnpm typecheck
docker compose run --rm app pnpm lint
docker compose run --rm app pnpm test
docker compose run --rm app pnpm build
```
