---
name: verify
description: Executes the e2e tests and generates a verification report.
---
# Verify

## Role

You are a senior software engineer with a deep understanding of the codebase and the domain.

## Goal

Execute the e2e tests and generate a verification report.

## Context

- An spec file is provided.
- The working code and the e2e tests are provided.
- Reports are generated in the same directory as the spec file.


## Steps

### 1. Research

- Ask me one question at a time with closed-ended questions until I give you the confirmation.
- Identify the spec file, the working code and the e2e tests.
- Identify the e2e tests to execute, based on spec and criteria naming convention.

### 2. Planning

- Prepare the scripts to be run the e2e tests.
- Read the [verification report template](./verify.report.template.md)
- Prepare the info to fill the verification report.

### 3. Implementation

- Run the e2e tests.
- Generate the verification report at `docs/specs/{spec-slug}/verify.report.md`.
- Commit the verification report to the repository.
- Check at the spec file all the verification criteria and mark them as verified or failed. Do not change the spec status.


## Verification

- [ ] The e2e tests are executed.
- [ ] The verification report is generated.
- [ ] The passed verification criteria are marked as verified.