package config

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

func (r *Repository) GetConnectionTypes() ([]ConnectionType, error) {
	var connectionTypes []ConnectionType
	query := "SELECT * FROM connection_types WHERE active = true"

	err := r.db.Select(&connectionTypes, query)
	if err != nil {
		return connectionTypes, err
	}

	return connectionTypes, nil
}
