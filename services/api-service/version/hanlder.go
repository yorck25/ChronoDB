package version

import (
	"backend/core"
)

func HandleCreateTable(ctx *core.WebContext) error {
	var ctr CreateTableRequest

	err := ctx.Bind(&ctr)
	if err != nil {
		return ctx.InternalError(err.Error())
	}

	repo := NewRepository(ctx)
	err = repo.CreateTable(ctr)
	if err != nil {
		return ctx.InternalError(err.Error())
	}

	return ctx.Sucsess()
}

func HandleUpdateTable(ctx *core.WebContext) error {
	return ctx.Sucsess()
}

func HandleDropTable(ctx *core.WebContext) error {
	return ctx.Sucsess()
}
