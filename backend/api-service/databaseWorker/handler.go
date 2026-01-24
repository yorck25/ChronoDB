package databaseWorker

import (
	"backend/connectors"
	"backend/core"
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

	return ctx.Sucsess(result[0])
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

	return ctx.Sucsess(res)
}
