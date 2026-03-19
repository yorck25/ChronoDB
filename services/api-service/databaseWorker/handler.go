package databaseWorker

import (
	"backend/commits"
	"backend/common"
	"backend/connectors"
	"backend/core"
	"fmt"
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

	res, err := HandleQueryWithCommit(ctx, conn, dbqr.Query)
	if err != nil {
		return ctx.InternalError("Fail to handle commit.")
	}

	return ctx.Sucsess(res)
}

func HandleQueryWithCommit(ctx *core.WebContext, conn connectors.DBConnector, query string) (*common.DatabaseQueryResult, error) {
	projectIDVal := ctx.Get("project_id")
	projectID, ok := projectIDVal.(int)
	if !ok {
		return nil, fmt.Errorf("invalid project_id")
	}

	pt, err := GetPerformanceType(query)
	if err != nil {
		return nil, fmt.Errorf("invalid query")
	}

	if pt == "ddl" {
		commitIds, err := commits.HandleCreateSchemaCommit(ctx, query, projectID, string(ActionFull), string(pt))
		if err != nil {
			return nil, fmt.Errorf("fail to create commits")
		}

		fmt.Println("ddl was performed")
	}

	res, err := conn.ExecuteQuery(projectID, query)
	if err != nil {
		return nil, err
	}

	return res, nil
}
