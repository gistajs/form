---
name: gistajs
description: Build or modify GistaJS routes, CRUD forms, authentication, database models and validators, and Atlas schema changes.
---

# GistaJS development

Read the target application's AGENTS.md and inspect adjacent routes, schema, models, auth middleware and form controls as the task requires. Choose by what the project actually provides. If the request needs a missing capability, identify that prerequisite before using recipes that depend on it.

Read each applicable reference before editing:

- One page or layout: [page](references/page.md)
- Tables, validators or server models: [model](references/model.md)
- Schema changes or Atlas plans: [migrate](references/migrate.md)
- CRUD routes or forms: [crud](references/crud.md), plus model when the data layer changes
- Authentication or resource access: [protect](references/protect.md)

Change only the requested layers. When several are involved, work in dependency order: schema, validators, model, routes, then any necessary tests.

## Tests

Add the fewest stable tests that catch a material regression beyond types and existing coverage. Prioritize authorization, billing, data invariants and concurrency, external contracts and nontrivial business rules. Test behavior instead of duplicating implementation choices such as CSS, copy or mock call order. When replacing such tests in critical areas, retain a named behavioral test for each material boundary they covered.
