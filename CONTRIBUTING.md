# Contributing

Thanks for taking the time to contribute. This document describes the branching
model, commit conventions and review process used in this repository.

## Branching model

| Branch      | Purpose                                                          |
| ----------- | ---------------------------------------------------------------- |
| `master`    | Production. Every commit is a tagged, deployable release.         |
| `develop`   | Integration branch. Completed work lands here first.              |
| `feature/*` | New functionality. Branched from and merged back into `develop`.  |
| `fix/*`     | Bug fixes. Branched from and merged back into `develop`.          |
| `chore/*`   | Tooling, docs, dependencies. Merged into `develop`.               |
| `hotfix/*`  | Urgent production fixes. Branched from `master`, merged into both `master` and `develop`. |

```
feature/xyz  ──PR──►  develop  ──release PR──►  master  ──►  tag vX.Y.Z
```

Direct pushes to `master` and `develop` are disabled. All changes arrive by
pull request.

## Workflow

1. Create a branch from `develop`:

   ```bash
   git checkout develop
   git pull
   git checkout -b feature/short-description
   ```

2. Make your changes, keeping each branch focused on a single concern.
3. Push and open a pull request against `develop`.
4. Wait for CI to pass, then merge. Delete the branch afterwards.

## Commit messages

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<optional scope>): <description>
```

Common types:

| Type       | Use for                                            |
| ---------- | -------------------------------------------------- |
| `feat`     | A new feature                                      |
| `fix`      | A bug fix                                          |
| `docs`     | Documentation only                                 |
| `refactor` | A change that neither fixes a bug nor adds a feature |
| `test`     | Adding or correcting tests                         |
| `chore`    | Tooling, dependencies, build configuration         |

Examples:

```
feat(reports): add date range selection to PDF export
fix(auth): reject expired tokens with 401 instead of 500
chore: pin Node version to 22
```

Write the description in the imperative mood and keep the subject line under
72 characters.

## Releases

Releases are cut from `develop` into `master`:

1. Open a pull request from `develop` to `master`.
2. Once merged, tag the merge commit with an annotated tag following
   [Semantic Versioning](https://semver.org/):

   ```bash
   git tag -a v1.1.0 -m "Release v1.1.0"
   git push origin v1.1.0
   ```

3. Publish a GitHub Release with notes describing the changes.

## Security

Never commit secrets. `.env` and `nodemon.json` are ignored by git; document new
configuration keys in `.env.example` instead. If you discover a vulnerability,
report it privately rather than opening a public issue.
