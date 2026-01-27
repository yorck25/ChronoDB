# Database Worker Middleware

## Overview

The **Database Worker Middleware** resolves project-specific database access for all routes under:

```
/api/v1/database-worker/*
```

It determines which database engine a project uses (PostgreSQL, MySQL, MSSQL), loads the stored credentials from the metadata database, and injects a database connector into the request context.

This allows the backend to serve **multiple projects with different database types concurrently** using a single API.

---

## Where it is applied

In `main.go`:

```go
workerRoot := app.Group("/api/v1/database-worker")
workerRoot.Use(core.WorkerMiddleware(app.Ctx.GetDb()))
```

Every request to `/api/v1/database-worker/*` must pass through this middleware.

---

## What the middleware does

### 1. Reads `project_id` from the request

The middleware requires the query parameter:

```
?project_id=<number>
```

If missing or invalid, the request is rejected.

---

### 2. Loads database credentials

Credentials are stored in the **metadata database** (PostgreSQL).

```sql
SELECT database_auth
FROM projects_credentials
WHERE project_id = $1
```

The result is JSON and is unmarshaled into:

```go
connectors.DatabaseAuth
```

---

### 3. Resolves the database type

The middleware determines which database engine the project uses:

```sql
SELECT connection_types.key
FROM connection_types
JOIN projects p ON connection_types.id = p.connection_type
WHERE p.id = $1
```

Supported types:
- `psql`
- `mysql`
- `mssql`

---

### 4. Creates the database connector

Based on the resolved type, a connector is created:

```go
switch connectionType {
case "psql":
    conn = &connectors.PostgresConnector{ MetaDataClient: metaDB }
case "mysql":
    conn = &connectors.MySQLConnector{ MetaDataClient: metaDB }
case "mssql":
    conn = &connectors.MSSQLConnector{ MetaDataClient: metaDB }
}
```

All connectors implement the shared interface:

```go
type DBConnector interface {
    GetDatabaseStructure(projectID int) (...)
    GetDatabaseVersion(projectID int) (...)
}
```

---

### 5. Injects values into request context

The middleware stores the following values in the request context:

```go
ctx.Set("db_connector", conn)
ctx.Set("project_id", projectID)
```

These values are request-scoped and safe for concurrent usage.

---

## How handlers use the middleware

Worker handlers do not need to know anything about database types or credentials.

They simply retrieve the connector:

```go
conn := core.GetConnector(ctx)
```

Example handler:

```go
func HandleGetDatabaseStructure(ctx *core.WebContext) error {
    conn := core.GetConnector(ctx)
    if conn == nil {
        return ctx.InternalError("database connector not found")
    }

    projectID := ctx.Get("project_id").(int)

    structure, err := conn.GetDatabaseStructure(projectID)
    if err != nil {
        return ctx.InternalError(err.Error())
    }

    return ctx.Sucsess(structure)
}
```

---

## Why middleware is used

### Advantages

- Supports multiple database engines concurrently
- Centralized validation (`project_id`, credentials, DB type)
- No duplicated database-selection logic in handlers
- Clean, database-agnostic worker endpoints
- Safe for concurrent requests

---

## Concurrency & safety

This design is safe because:

- A new connector instance is created per request
- No shared mutable state exists between requests
- Context values are request-scoped
- Different users/projects can access different DB types at the same time

---

## Assumptions

- The metadata database (`metaDB`) is PostgreSQL
- Connector implementations are stateless
- Real database connections are created inside connector methods

---

## Helper function

```go
func GetConnector(c echo.Context) connectors.DBConnector {
    conn, ok := c.Get("db_connector").(connectors.DBConnector)
    if !ok {
        return nil
    }
    return conn
}
```

---

## Possible future improvements

- Cache resolved credentials per `project_id` (short TTL)
- Store `DatabaseAuth` directly in the request context
- Merge metadata queries into a single SQL query
- Replace `project_id` query param with JWT-based scoping

---

## Summary

The Database Worker Middleware acts as a **database resolver layer** that:

- Validates project access
- Resolves database type and credentials
- Injects the correct connector
- Enables clean and extensible worker endpoints

This keeps the backend scalable and database-agnostic.
