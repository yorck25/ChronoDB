package main

import (
	"backend/config"
	"backend/core"
	"backend/databaseWorker"
	"backend/projects"
	"backend/release"
	"backend/user"
	"backend/version"

	"github.com/labstack/echo/v4/middleware"
)

type UserClaims struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func main() {
	app, err := core.InitApp()

	if err != nil {
		panic(err)
	}

	app.Use(middleware.CORSWithConfig(middleware.DefaultCORSConfig))
	mainRoot := app.Group("/api/v1")
	workerRoot := app.Group("/api/v1/database-worker")
	workerRoot.Use(core.WorkerMiddleware(app.Ctx.GetDb()))

	//---------------------------------
	// MAIN ROUTES
	//---------------------------------
	mainRoot.GET("/", defaultUrl)
	mainRoot.GET("/health", healthUrl)

	mainRoot.GET("/config/connection-types", config.HandleGetConnectionTypes)

	mainRoot.POST("/auth/login", user.HandleLogin)
	mainRoot.POST("/auth/register", user.HandleRegister)
	mainRoot.GET("/auth/me", user.HandleGetProfile)

	mainRoot.GET("/users/search", user.HandleSearchMembers)

	mainRoot.GET("/projects", projects.GetAllProjectsWithUsersForUser)
	mainRoot.GET("/projects/all", projects.HandleGetAllProjects)
	mainRoot.GET("/projects/active", projects.HandleGetActiveProjects)
	mainRoot.GET("/projects/:id", projects.HandleGetProjectByID)
	mainRoot.POST("/projects", projects.HandleCreateProject)
	mainRoot.PUT("/projects/:id", projects.HandleUpdateProject)
	mainRoot.DELETE("/projects/:id", projects.HandleDeleteProject)
	mainRoot.POST("/projects/test-connection", projects.HandleTestProjectConnection)
	mainRoot.GET("/projects/:projectId/commits", projects.HandleGetCommits)

	mainRoot.GET("/release/project/all", release.HandleGetReleasesForProject)
	mainRoot.GET("/release/project/latest", release.HandleGetLatestReleasesForProject)
	mainRoot.POST("/version/table/create", version.HandleCreateTable)

	//---------------------------------
	// WORKER ROUTES
	//---------------------------------
	workerRoot.GET("/db-version", databaseWorker.HandleGetDatabaseVersion)
	workerRoot.GET("/db-structure", databaseWorker.HandleGetDatabaseStructure)
	workerRoot.POST("/execute-query", databaseWorker.HandleDatabaseQuery)

	app.Logger.Fatal(app.Start("0.0.0.0:8080"))
}

func defaultUrl(ctx *core.WebContext) error {
	return ctx.Sucsess("This is the backend")
}

func healthUrl(ctx *core.WebContext) error {
	return ctx.Sucsess("OK")
}
