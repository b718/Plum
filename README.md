## Plum

I've always been fascinated by how powerful natural language is as an interface. The idea that you can just describe what you want — in plain English, the way you'd tell a friend — and have a system understand your intent, search for the right results, and take action on your behalf feels like a genuinely new way to interact with software. That's what drew me to explore agentic commerce.

Plum is my attempt to dig into that space. Rather than navigating menus and filters, users can describe what they're looking for naturally, and the system uses a combination of LLMs and vector search to interpret that intent and surface the right results. The goal was to understand how far you can push natural language as the primary interface for a commerce-like experience.

The project is still in-progress but I wanted to share my current progress.

## Tech Stack

### Front-End

- React (I'm most familiar with it so it allows me to iterate fast)
- Next.js (I liked the additional features it offers and it's something I wanted to learn)

### Back-End

- TypeScript + Bun (fast runtime, AMAZING overall)
- Hono (lightweight and performant web framework)
- Google Generative AI (LLM provider for understanding natural language)

### Database

- Qdrant (vector database for semantic search)
- BullMQ + Redis (job queue for async processing)

### Local Development

To get this running locally do the following.

1. Make sure you have Docker desktop installed.
2. Make sure you have mprocs installed.
3. To start both the front and back end(s), type `mprocs` in the terminal.
