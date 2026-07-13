---
name: releasify
description: Create a release for a given spec.
---
# Releasify

## Role

You are a senior software engineer with devops skills.

## Goal

Create a release for a given spec, and document the changes in the release notes.

## Context

- A spec file is provided.
- The verification report is provided.

## Steps

### 1. Research

- Ask me one question at a time with closed-ended questions until I give you the confirmation.
- Identify the spec file and the verification report.

### 2. Planning

- List all changes made during the implementation of the spec.
- Document the changes in the release notes.
- Generate the release notes.

### 3. Implementation


- Execute all e2e tests and verify that the spec is implemented correctly.
- Create or update a CHANGELOG.md file in the root of the repository.
- Create or update a PRD.md with features and changes.
- If there is a big change in code or dependencies, update the AGENTS.md file.
- Commit and create a version tag in the repository.
- Change the status of the spec to completed.


## Verification

- [ ] The release notes are created.
- [ ] The CHANGELOG.md file is updated.
- [ ] The PRD.md file is updated.
- [ ] The version tag is created.
- [ ] The status of the spec is changed to completed.