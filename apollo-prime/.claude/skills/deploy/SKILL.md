---
name: deploy
description: >
  Commit with a [deploy] tag in the message and push to trigger a Vercel preview deployment.
  Use when the user says "deploy", "deploy preview", "/deploy", "trigger a deploy",
  or asks to deploy their branch to Vercel preview.
---

# Deploy

Create a commit with `[deploy]` in the message and push it to trigger a Vercel preview deployment.

## Branch Protection

Branch protection is enforced automatically by a `PreToolUse` hook on `git commit` and `git push`. The hook checks `CLAUDE.local.md` for maintainer status and blocks non-maintainers from committing or pushing on `main`/`master`. You do not need to check this manually — the hook will block the command and provide feedback if the user is not allowed.

## Deploy Steps

1. Run `git status` (never use `-uall`) and `git diff` to see all changes.
2. Run `git log --oneline -5` to see recent commit message style.
3. Analyze the changes and draft a commit message. **Prepend `[deploy]`** to the message, e.g.:
   ```
   [deploy] Add new dashboard prototype
   ```
4. Show the user the proposed commit message, the list of files to be staged, and inform them this will trigger a **Vercel preview deployment**. **Ask for confirmation**.
5. Stage the relevant files (prefer explicit file names over `git add -A`).
6. Create the commit. Always append the co-author trailer:
   ```
   Co-Authored-By: Claude <noreply@anthropic.com>
   ```
7. Push to remote:
   - If the branch has an upstream: `git push`
   - If not: `git push -u origin <branch-name>`
8. After pushing, confirm success and remind the user that the Vercel preview deployment should be triggered shortly.

## Deploy with No Changes

If the user wants to trigger a deploy but there are no code changes (e.g., to re-trigger a build), create an empty-ish commit:

```
[deploy] Trigger redeploy
```

Use `git commit --allow-empty` for this case. Still ask for confirmation before proceeding.

## Important

- The `[deploy]` prefix is what triggers the Vercel preview build — it must be at the start of the commit message.
- Never commit files that may contain secrets.
- Never force-push unless explicitly requested and confirmed.
