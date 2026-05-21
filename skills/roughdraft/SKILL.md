---
name: roughdraft
description: "Roughdraft is a tool for agent/user collaboration on Markdown files based on CriticMarkup. Use this skill for Roughdraft requests, `rd` shorthand, Markdown review, CriticMarkup, inline comments, suggested changes, plan review, and back-and-forth document feedback."
---

# Roughdraft

Use Roughdraft to turn a normal local Markdown file into a shared review surface between the agent and the user. The file on disk is the durable source of truth: the agent writes or updates it, Roughdraft opens it locally for the user, the user comments or suggests changes, then the agent reads the same file back and responds.

## Assumptions

Assume Roughdraft is installed globally and available as `roughdraft`. If the command is missing, ask the user to install it or run the setup they prefer instead of inventing a local wrapper.

Treat `rd` as shorthand for Roughdraft in natural language. Do not create aliases, symlinks, shell functions, or executables named `rd`.

## Core Handoff Loop

1. Make sure the document is a normal `.md` file on disk. If you need a working document, create it in the requested path before opening it.
2. Start or reuse the Roughdraft server:

```bash
roughdraft start
```

3. Open the file and wait for the user to click **Done Reviewing**:

```bash
roughdraft open "/absolute/path/to/file.md"
```

4. After the command returns, read the Markdown file from disk before making conclusions or edits.
5. Respond to the user's feedback by editing the Markdown file directly, adding CriticMarkup replies, or applying suggested changes.
6. If another review pass is useful, reopen the updated file and repeat the loop.

Prefer the blocking `open` command for collaboration because it gives the user an explicit review phase and gives the agent a reliable resume point. Use `--no-watch` only when the user wants the browser opened without waiting.

User review usually takes a couple of minutes or longer. Take that human timescale into account when choosing terminal poll intervals for a blocking Roughdraft call. If the environment cannot wait comfortably, open the file with `--no-watch` or `--print-url`, end the turn, and rely on the user to say when they are finished reviewing.

## Agent-Friendly Command Variants

Use JSON when another script or tool needs structured completion data:

```bash
roughdraft open "/absolute/path/to/file.md" --json
```

Use `--print-url` or `--no-open` when the user needs a link or when browser launch is intentionally disabled:

```bash
roughdraft open "/absolute/path/to/file.md" --print-url
roughdraft open "/absolute/path/to/file.md" --no-open
```

Use status and stop commands for lifecycle checks:

```bash
roughdraft status
roughdraft status --json
roughdraft stop
```

Roughdraft also exposes an experimental MCP server:

```bash
roughdraft mcp
```

Use MCP only when the host environment already supports it and the task benefits from tool-level access to review indexes, pending feedback, replies, or review events. The Markdown file remains the durable source of truth.

## Reading Feedback

After `Done Reviewing`, read the file itself. Do not rely only on terminal output such as feedback counts; counts tell you that feedback exists, not what it says.

Roughdraft stores comments and suggestions as CriticMarkup:

```markdown
This is {>>a comment<<} in the margin.
This is {++inserted text++}.
This is {--deleted text--}.
This is {~~old text~>new text~~}.
This is {==highlighted text==}.
```

Roughdraft may attach attributes after markers:

```markdown
Please revisit {==this sentence==}{>>Needs a source<<}{id="c1" by="user" at="2026-04-28T12:00:00.000Z"}.
```

Replies point at an existing item with `re`:

```markdown
Please revisit {==this sentence==}{>>Needs a source<<}{id="c1" by="user" at="2026-04-28T12:00:00.000Z"}{>>I added one below.<<}{id="c2" by="AI" at="2026-04-28T12:05:00.000Z" re="c1"}.
```

CriticMarkup inside inline code and fenced code blocks is literal example text, not live review feedback.

For complete format rules, read `references/roughdraft-flavored-markdown.md`, copied from `https://www.roughdraft.md/spec/roughdraft-flavored-markdown.md`. Use that reference before manually editing Roughdraft Flavored Markdown in a way that creates, changes, resolves, or preserves comments, suggestions, metadata, threaded replies, or code-context marker text.

## Responding To Feedback

Choose the smallest response that preserves the conversation:

- Apply an accepted suggestion by editing the surrounding Markdown into the desired final text.
- Reply with `{>>...<<}{id="..." by="AI" at="..." re="..."}` when discussion should remain visible.
- Add a new comment when the agent needs to ask a document-local question or explain a local decision.
- Leave unresolved feedback intact when the user has not approved a decision or when the correct edit is unclear.

Use stable, document-local ids that do not collide with existing ids. Prefer ISO timestamps for `at`. Use `by="AI"` for agent-authored review replies unless the project has a more specific convention.

Do not silently delete user comments just because you acted on them. Preserve review history unless the user asks for a clean document or the workflow clearly calls for accepting/removing markup.

## Planning Workflow

For plan reviews, write the plan as a Markdown file first. In repositories, a temporary ignored path such as `.context/` is often appropriate when local instructions allow it; otherwise use the location the user requested. Open the plan in Roughdraft with the blocking workflow, then read the reviewed file and address CriticMarkup feedback before implementation.

If the user has asked for a plan only, stop after revising the plan and summarizing what changed. Do not implement the plan unless the user explicitly asks for implementation.

## Failure Handling

If opening a browser is wrong for the environment, set or respect:

```bash
ROUGHDRAFT_NO_OPEN=1
ROUGHDRAFT_BROWSER=/path/to/browser
```

If `open` cannot wait because the user only needs a URL, use `--print-url` and explain that the agent will need another signal before reading feedback.

When a command fails, report the command, the failure class, and the next concrete unblocker. Do not invent a review result without reading the file.
