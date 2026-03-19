package release

import (
	"backend/core"
	"github.com/jmoiron/sqlx"
)

type Repository struct {
	db *sqlx.DB
}

func NewRepository(ctx *core.WebContext) *Repository {
	return &Repository{db: ctx.GetDb()}
}

func (r *Repository) GetReleasesForProject(projectId int) ([]Release, error) {
	var releases []Release

	stmt, err := r.db.PrepareNamed("SELECT * FROM releases WHERE project_id = :projectId ORDER BY id")
	if err != nil {
		return releases, err
	}

	params := map[string]any{
		"projectId": projectId,
	}

	err = stmt.Select(&releases, params)
	if err != nil {
		return releases, err
	}

	return releases, nil
}

func (r *Repository) GetLatestReleasesForProject(projectId int) (Release, error) {
	var release Release

	stmt, err := r.db.PrepareNamed("SELECT * FROM releases WHERE project_id = :projectId ORDER BY id DESC LIMIT 1")
	if err != nil {
		return release, err
	}

	params := map[string]any{
		"projectId": projectId,
	}

	err = stmt.Get(&release, params)
	if err != nil {
		return release, err
	}

	return release, nil
}
