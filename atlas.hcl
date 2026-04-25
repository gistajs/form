data "external_schema" "drizzle" {
  program = [
    "npx",
    "drizzle-kit",
    "export",
  ]
}

env "dev" {
  url = "sqlite://data/dev.db"
  dev = "sqlite://dev?mode=memory"
  schema {
    src = data.external_schema.drizzle.url
  }
}

env "prod" {
  url = "${getenv("DB_URL")}?authToken=${getenv("DB_AUTH_TOKEN")}"
  dev = "sqlite://dev?mode=memory"
  schema {
    src = data.external_schema.drizzle.url
  }
}
