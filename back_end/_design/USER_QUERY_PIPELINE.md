### User Query Pipeline

The goal of this project is to make commerce easier, however, when users are allowed to query for products with natural language, there is a high probability that they will type information that is not useful for the search-engine. This is why we need a pipeline to filter down the inital query from the user to make it easier for the search engine to provide the best results possible. The pipeline will look something like the diagram below.

```
┌─────────────────────────────────┐
│     User Prompt Ingestion       │  ← receive & validate raw input
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│     Transform User Input        │  ← LLM call to extract intent/keywords
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│      Embed User Input           │  ← convert to vector representation
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│       Query Database            │  ← vector/semantic search
└────────────────┬────────────────┘
                 │
┌────────────────▼────────────────┐
│      Return Queried Results     │  ← rank, format, push via SSE
└─────────────────────────────────┘
```

---

### Server Response Strategy

Because the transform step involves an LLM call, results cannot be returned synchronously. The server will instead respond using Server-Sent Events.

**Flow:**

1. Client submits a query via `POST /search` and receives a `job_id` immediately.
2. Client opens a persistent SSE connection to `GET /results/:job_id`.
3. The server processes the pipeline asynchronously (transform → embed → query).
4. Once results are ready, the server pushes a single event and closes the stream.

**Server response format (`text/event-stream`):**

```
data: {"status": "processing"}

data: {"status": "complete", "results": [...]}
```

On the server, each `GET /results/:job_id` handler returns a `Response` with a `ReadableStream`, writing events as the job progresses and closing the stream when done.
