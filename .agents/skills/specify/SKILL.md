---
name: specify
description: Writes an specification for a task ina natural but formal way.
---
# SPECIFY

## Role

Act as a business analyst.

## Goal

Write a specification for the task in a natural but formal way, maximizing the signal/noise ratio.

## Context

- Specs folder at `/docs/specs`

### Input 

- Can be one of:

  - A user requirement
  - A document 
  - A remote web resource

## Steps

### 1. Research

- Think about input type (user, document, remote web resource)
- Read the [spec template](./spec.template.md)
- Ask me one question at a time with closed-ended questions until I give you the confirmation.
- Do not invent any information, only ask questions.

### 2. Planning

- Fill the template placeholders with the information you have gathered.
- Derive the id and feature name and slug from the input.

### 3. Implementation

- Write the specification at a new folder in the specs folder.
- Use this naming convention: `/docs/specs/{id}-{feature-slug}/spec.md`

## Verification

- [ ] The spec file is created in the specs folder.
- [ ] All placeholders are filled with the information you have gathered.
- [ ] The document has the correct format.