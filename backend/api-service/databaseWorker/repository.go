package databaseWorker

import (
	"backend/core"
	"database/sql"

	"github.com/jmoiron/sqlx"
)

type Repository struct {
	db *sqlx.DB
}

func NewRepository(ctx *core.WebContext) *Repository {
	return &Repository{db: ctx.GetDb()}
}

func (r *Repository) CreateSchemaCommit(sc SchemaCommit) (int, error) {
	query := `
		INSERT INTO schema_commits (
			project_id,
			checksum,
			parent_checksum,
			action_type,
			title,
			message,
			up_script,
			down_script,
			author_user_id
		)
		VALUES (
			:project_id,
			:checksum,
			:parent_checksum,
			:action_type,
			:title,
			:message,
			:up_script,
			:down_script,
			:author_user_id
		)
		RETURNING id;
	`

	params := map[string]any{
		"project_id":      sc.ProjectID,
		"checksum":        sc.Checksum,
		"parent_checksum": sc.ParentChecksum,
		"action_type":     sc.ActionType,
		"title":           sc.Title,
		"message":         sc.Message,
		"up_script":       sc.UpScript,
		"down_script":     sc.DownScript,
		"author_user_id":  sc.AuthorUserID,
	}

	rows, err := r.db.NamedQuery(query, params)
	if err != nil {
		return 0, err
	}
	defer rows.Close()

	if rows.Next() {
		var id int
		if err := rows.Scan(&id); err != nil {
			return 0, err
		}
		return id, nil
	}

	return 0, sql.ErrNoRows
}
