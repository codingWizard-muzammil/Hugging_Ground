# Hugging Ground

A playground for [Hugging Face](https://huggingface.co) models that runs
entirely in your browser. Paste your own HF API key, search or pick any
model on the Hub, and start playing — no account, no signup, nothing
stored anywhere but your own browser's local storage.

**Live demo:** [hugging-ground.netlify.app](https://hugging-ground.netlify.app/)

Since the app is 100% client-side with no backend or server-side secrets
to protect, it deploys as a static site — Netlify just builds and serves
the Next.js output directly, and every model request from that deployment
still goes straight from your browser to Hugging Face.

## Features

- **Bring your own key, nothing else.** No auth flow, no backend — your
  Hugging Face token is saved to `localStorage` and sent straight to
  Hugging Face. It never touches a server of ours.
- **Any model, auto-detected.** Search the whole Hub or paste an exact
  model id. Hugging Ground reads the model's task from its Hub metadata
  and opens the right interface for it automatically.
- **Streaming chat.** Conversational and vision models get a full chat UI
  with token-by-token streaming, image attachments, and markdown
  rendering.
- **Every other task, too.** Text-to-image, image-to-image, text-to-speech,
  speech-to-text, audio classification, object detection, image
  segmentation, captioning, summarization, translation, question
  answering, zero-shot classification, named entity recognition, sentence
  similarity, and more — each with a matching input form and result view
  (label bars, bounding-box overlays, mask galleries, audio/image
  players).
- **Drop almost anything.** Drag and drop or paste images, audio, or text
  files onto the composer or a task's dropzone.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), paste a Hugging Face
API key (create one for free at
[huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)),
and pick a model.

## How it works

Every request goes directly from your browser to Hugging Face's
[Inference Providers](https://huggingface.co/docs/inference-providers)
API via the official [`@huggingface/inference`](https://www.npmjs.com/package/@huggingface/inference)
client. There's no API route or server in between — this app is a static
Next.js frontend, and your API key is the only thing that authenticates
your requests.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- Tailwind CSS v4
- [`@huggingface/inference`](https://www.npmjs.com/package/@huggingface/inference)
  for all model calls
- [`react-markdown`](https://www.npmjs.com/package/react-markdown) for
  chat responses

## Project structure

```
src/
  app/                 Next.js routes, layout, generated icons
  components/          UI — chat, task forms, model picker, header
  context/             API key context (localStorage-backed)
  lib/hf/              Task dispatch table, chat streaming, Hub search
  lib/                 Shared client-side storage/utility helpers
```

See `CLAUDE.md` for a deeper architecture note if you're extending it.
