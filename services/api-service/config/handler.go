package config

import "backend/core"

func HandleGetConnectionTypes(ctx *core.WebContext) error {
	_, err := ctx.GetUserId()
	if err != nil {
		return ctx.Unauthorized(err.Error())
	}

	repo := NewRepository(ctx)
	project, err := repo.GetConnectionTypes()
	if err != nil {
		return ctx.NotFound("connection types not found")
	}

	return ctx.Sucsess(project)
}
