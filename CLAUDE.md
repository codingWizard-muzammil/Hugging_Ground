@AGENTS.md

# Hugging Ground

A fully client-side playground for the Hugging Face Inference Providers API.
A user pastes their own HF token, picks any model on the Hub, and plays with
it — chat, image/audio generation, classification, and a dozen other tasks —
with no login, no signup, and no backend of ours in the request path.

## Architecture

- **No backend.** Every model call goes straight from the browser to
  Hugging Face via `@huggingface/inference`'s `InferenceClient`. The user's
  token lives only in `localStorage` (`src/lib/storage.ts`,
  `src/lib/api-key-store.ts`) and is used to construct the client in
  `src/context/api-key-context.tsx`. There is no `/api` route handler and
  there should not need to be one — keeping the token off any server we run
  is the point.
- **Dynamic task dispatch.** `src/lib/hf/tasks.ts` maps a Hub model's
  `pipeline_tag` (fetched via `src/lib/hf/hub.ts`, the public
  `huggingface.co/api/models` endpoint) to a `TaskDef`: an input shape, an
  output shape, and a `run()` that calls the matching `InferenceClient`
  method. `src/components/Playground.tsx` reads the tag and renders either
  `ChatView` (conversational / vision-chat pipeline tags) or `TaskView`
  (everything with an entry in `TASKS`). Adding support for another
  pipeline tag means adding one entry to `TASKS` — the UI, input form, and
  output renderer are generic and switch on `inputKind` / `outputKind`.
- **Chat streaming.** `src/lib/hf/chat.ts` wraps
  `client.chatCompletionStream` (OpenAI-compatible SSE under the hood) and
  yields text deltas; `ChatView` appends them to the in-progress assistant
  message as they arrive. Image attachments become `image_url` content
  parts; text-like file attachments get inlined into the message text;
  anything else is kept in the UI but flagged as not sent, since chat
  completions can't carry arbitrary binaries.
- **Component reset via `key`, not effects.** Model-scoped state (chat
  history, task form fields) resets by remounting `ChatView`/`TaskView`
  with `key={model.id}` in `Playground.tsx`, rather than an effect that
  calls `setState` on prop change. This project's ESLint config enforces
  `react-hooks/set-state-in-effect`, and the codebase leans on
  `useSyncExternalStore` (see `theme-store.ts`, `api-key-store.ts`) for
  anything that genuinely syncs with an external system like
  `localStorage`. Follow that pattern rather than reaching for
  `useEffect` + `useState` to mirror external or prop-derived state.
- **Styling.** Tailwind v4, dark-by-default, toggled via a `.dark` class
  (`@custom-variant dark` in `globals.css`) rather than the media-query
  default, so the theme can be user-controlled and persisted.

## Before writing Next.js code

Read `AGENTS.md` — the version of Next.js pinned here diverges from
training data in places, and the docs are vendored at
`node_modules/next/dist/docs/`.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build (also type-checks)
- `npx tsc --noEmit` — type-check only
- `npm run lint` — ESLint

## Verifying HF API assumptions

Endpoint shapes and field names here came from live docs fetches and
`@huggingface/inference`'s shipped `.d.ts` files, not from memory — HF's
API surface moves. If something in `src/lib/hf/` stops matching reality,
re-check the installed package's types under
`node_modules/@huggingface/inference/dist/esm/tasks/` and
`node_modules/@huggingface/tasks/dist/esm/tasks/*/inference.d.ts` before
guessing at a fix.
