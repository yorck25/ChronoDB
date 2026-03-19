package release

import (
	"backend/core"
	"strconv"
)

func HandleGetReleasesForProject(ctx *core.WebContext) error {
	projectId, err := strconv.Atoi(ctx.Request().Header.Get("projectId"))
	if err != nil {
		return ctx.BadRequest("Invalid project ID")
	}

	repo := NewRepository(ctx)

	releases, err := repo.GetReleasesForProject(projectId)
	if err != nil {
		return ctx.InternalError("Failed to get releases: " + err.Error())
	}

	return ctx.Sucsess(releases)
}

func HandleGetLatestReleasesForProject(ctx *core.WebContext) error {
	projectId, err := strconv.Atoi(ctx.Request().Header.Get("projectId"))
	if err != nil {
		return ctx.BadRequest("Invalid project ID")
	}

	repo := NewRepository(ctx)

	release, err := repo.GetLatestReleasesForProject(projectId)
	if err != nil {
		return ctx.InternalError("Failed to get releases: " + err.Error())
	}

	return ctx.Sucsess(release)
}
