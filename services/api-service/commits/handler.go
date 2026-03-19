package commits

import (
	"backend/connectors"
	"backend/core"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
)

func RollbackCommit(ctx *core.WebContext) error {
	checksum := ctx.Request().Header.Get("checksum")
	if checksum == "" {
		return ctx.BadRequest("invalid checksum header")
	}

	connInterface := ctx.Get("db_connector")
	if connInterface == nil {
		return ctx.InternalError("database connector not found")
	}
	conn, ok := connInterface.(connectors.DBConnector)
	if !ok {
		return ctx.InternalError("invalid connector type")
	}

	repo := NewRepository(ctx)

	sc, err := repo.GetCommitByChecksum(checksum)
	if err != nil {
		return ctx.InternalError("Fail to find commit")
	}

	result, err := conn.ExecuteQuery(sc.ProjectID, sc.DownScript)
	if err != nil {
		return ctx.InternalError(err.Error())
	}

	return ctx.Sucsess(result)
}

func HandleCreateSchemaCommit(ctx *core.WebContext, query string, projectId int, action string, pt string) ([]int, error) {
	var commitIds []int

	userId, err := ctx.GetUserId()
	if err != nil {
		return err
	}

	repo := NewRepository(ctx)
	queries := regexp.MustCompile(";+").Split(query, -1)
	parent := uuid.New().String()

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
			ProjectID:      projectId,
			Checksum:       uuid.New().String(),
			ParentChecksum: &parent,
			ActionType:     action,
			Title:          "Full Commit",
			Message:        pt,
			UpScript:       query,
			DownScript:     down,
			AuthorUserID:   &userId,
			CreatedAt:      time.Now(),
		}

		var commitId int
		commitId, err := repo.CreateSchemaCommit(sc)
		if err != nil {
			return err
		}

		commitIds = append(commitIds, commitId)
	}

	return nil
}
