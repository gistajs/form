# Atlas schema changes

Check the project's Atlas config, package scripts and intended database (local or production). In a project configured for declarative Atlas, the user runs the applicable script, typically `pnpm atlas` or `pnpm atlas:prod`, reviews the concrete schema apply plan and chooses whether to apply it. Help interpret the plan or reported errors, particularly drops or SQLite table rebuilds that could affect existing data.

Leave Atlas, drizzle-kit and migration commands to the user. Never use `--auto-approve`, pipe `yes` or otherwise answer the approval prompt. Use the project's declarative workflow instead of generating versioned migrations. A schema export or successful type check does not establish that the database has been updated.
