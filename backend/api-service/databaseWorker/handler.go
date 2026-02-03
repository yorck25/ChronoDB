package databaseWorker

import (
	"backend/connectors"
	"backend/core"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
)

func HandleGetDatabaseVersion(ctx *core.WebContext) error {
	connInterface := ctx.Get("db_connector")
	if connInterface == nil {
		return ctx.InternalError("database connector not found")
	}
	conn, ok := connInterface.(connectors.DBConnector)
	if !ok {
		return ctx.InternalError("invalid connector type")
	}

	projectIDVal := ctx.Get("project_id")
	projectID, ok := projectIDVal.(int)
	if !ok {
		return ctx.InternalError("invalid project_id")
	}

	result, err := conn.ExecuteQuery(projectID, conn.GetVersionQuery())
	if err != nil {
		return ctx.InternalError(err.Error())
	}

	return ctx.Sucsess(result)
}

func HandleGetDatabaseStructure(ctx *core.WebContext) error {
	connInterface := ctx.Get("db_connector")
	if connInterface == nil {
		return ctx.InternalError("database connector not found")
	}
	conn, ok := connInterface.(connectors.DBConnector)
	if !ok {
		return ctx.InternalError("invalid connector type")
	}

	projectIDVal := ctx.Get("project_id")
	projectID, ok := projectIDVal.(int)
	if !ok {
		return ctx.InternalError("invalid project_id")
	}

	structure, err := conn.GetDatabaseStructure(projectID)
	if err != nil {
		return ctx.InternalError(err.Error())
	}

	return ctx.Sucsess(structure)
}

func HandleDatabaseQuery(ctx *core.WebContext) error {
	var dbqr DatabaseQueryRequest
	if err := ctx.Bind(&dbqr); err != nil {
		return ctx.BadRequest("invalid input")
	}

	connInterface := ctx.Get("db_connector")
	if connInterface == nil {
		return ctx.InternalError("database connector not found")
	}
	conn, ok := connInterface.(connectors.DBConnector)
	if !ok {
		return ctx.InternalError("invalid connector type")
	}

	projectIDVal := ctx.Get("project_id")
	projectID, ok := projectIDVal.(int)

	res, err := conn.ExecuteQuery(projectID, dbqr.Query)
	if err != nil {
		return ctx.InternalError(err.Error())
	}

	pt, err := GetPerformanceType(dbqr.Query)
	if err != nil {
		return ctx.InternalError("invalid query")
	}

	var commitIds []int

	if pt == "ddl" {
		parent := uuid.New().String()
		repo := NewRepository(ctx)

		queries := regexp.MustCompile(";+").Split(dbqr.Query, -1)
		for _, query := range queries {
			query = strings.TrimSpace(query)
			if query == "" {
				continue
			}

			down := ""
			if d, ok := DeriveDownScript(query); ok {
				down = d
			}

			sc := SchemaCommit{
				ProjectID:      projectID,
				Checksum:       uuid.New().String(),
				ParentChecksum: &parent,
				ActionType:     ActionFull,
				Title:          "Full Commit",
				Message:        string(pt),
				UpScript:       query,
				DownScript:     down,
				CreatedAt:      time.Now(),
			}

			var commitId int
			commitId, err = repo.CreateSchemaCommit(sc)
			if err != nil {
				return err
			}

			commitIds = append(commitIds, commitId)
		}

		fmt.Println("ddl was performed")
	}

	return ctx.Sucsess(res)
}
