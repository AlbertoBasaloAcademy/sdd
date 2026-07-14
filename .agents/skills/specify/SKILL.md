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
- PRD file at `/docs/specs/PRD.md`

### Input 

- Can be one of:

  - A user requirement
  - A document 
  - A remote web resource

## Steps

### 1. Research

- Think about input type (user, document, remote web resource)
- Read the [spec template](./spec.template.md)
- Read the [PRD template](./PRD.template.md)
- Ask me one question at a time with closed-ended questions until I give you the confirmation.
- Do not invent any information, only ask questions.
- Read the PRD file and understand the categories and features.
- Infer the category of the request and open `/PRD.md` at that section.
- Search the listed specs (and their tags) for an existing feature that the request modifies or contradicts.
- If a match is found, propose it to me as an **amendment** and ask for confirmation.
- If the category does not exist in the PRD, propose the new category and ask for confirmation. Never invent categories silently.

### 2. Planning

- Fill the template placeholders with the information you have gathered.
- Derive the id and feature name and slug from the input.

### 3. Implementation

#### 3.1 It it is a new feature
- Write the specification at a new folder in the specs folder.
- Use this naming convention: `/docs/specs/{id}-{feature-slug}/spec.md`

#### 3.2 It is an amendment to an existing feature
- Update the existing spec file and set status in-progress and date of modification.
- Update the PRD file to reflect the changes.

## Verification

- [ ] The spec file is created or updated in the specs folder.
- [ ] The PRD file is updated to reflect the changes.
- [ ] All placeholders are filled with the information you have gathered.
- [ ] The document has the correct format.