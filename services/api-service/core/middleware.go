package core

import (
	"backend/connectors"
	_ "context"
	"encoding/json"
	"fmt"
	"github.com/jmoiron/sqlx"
	"strconv"

	"github.com/labstack/echo/v4"
)

const ConnectorKey = "db_connector"

func WorkerMiddleware(metaDB *sqlx.DB) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			ctx := c.(*WebContext)

			projectIDStr := ctx.QueryParam("project_id")
			if projectIDStr == "" {
				return ctx.BadRequest("project_id is required")
			}

			projectID, err := strconv.Atoi(projectIDStr)
			if err != nil {
				return ctx.BadRequest("invalid project_id")
			}

			var authJSON string
			query := `SELECT database_auth FROM projects_credentials WHERE project_id = $1`
			if err := metaDB.QueryRow(query, projectID).Scan(&authJSON); err != nil {
				return ctx.InternalError(fmt.Sprintf("failed to get credentials: %v", err))
			}

			var auth connectors.DatabaseAuth
			if err := json.Unmarshal([]byte(authJSON), &auth); err != nil {
				return ctx.InternalError(fmt.Sprintf("invalid JSON: %v", err))
			}

			var connectionType string
			connectionTypeQuery := `SELECT connection_types.key FROM connection_types JOIN projects p on connection_types.id = p.connection_type WHERE p.id = $1`
			if err := metaDB.QueryRow(connectionTypeQuery, projectID).Scan(&connectionType); err != nil {
				return ctx.InternalError(fmt.Sprintf("failed to get credentials: %v", err))
			}

			fmt.Println(connectionType)

			var conn connectors.DBConnector
			switch connectionType {
			case "psql":
				conn = &connectors.PostgresConnector{
					MetaDataClient: metaDB,
				}
			case "mysql":
				conn = &connectors.MySQLConnector{
					MetaDataClient: metaDB,
				}
			case "mssql":
				conn = &connectors.MSSQLConnector{
					MetaDataClient: metaDB,
				}
			default:
				return ctx.BadRequest("unsupported database type")
			}

			ctx.Set("db_connector", conn)
			ctx.Set("project_id", projectID)

			return next(ctx)
		}
	}
}

func GetConnector(c echo.Context) connectors.DBConnector {
	conn, ok := c.Get(ConnectorKey).(connectors.DBConnector)
	if !ok {
		return nil
	}
	return conn
}
