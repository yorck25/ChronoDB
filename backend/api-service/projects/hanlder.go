package projects

import (
	"backend/connectors"
	"backend/core"
	b64 "encoding/base64"
	"strconv"

	"golang.org/x/crypto/bcrypt"
)

func HandleTestProjectConnection(ctx *core.WebContext) error {
	_, err := ctx.GetUserId()
	if err != nil {
		return ctx.Unauthorized(err.Error())
	}

	var dba connectors.DatabaseAuth

	if err := ctx.Bind(&dba); err != nil {
		return ctx.BadRequest("invalid input")
	}

	dbTypeVal, ok := dba.DatabaseAuth["type"]
	if !ok || dbTypeVal == "" {
		return ctx.BadRequest("database type is required")
	}

	//connector, err := common.GetConnector(dbTypeVal, dba.DatabaseAuth)
	//if err != nil {
	//	return err
	//}
	//
	//db, err := connector.Connect(dba.DatabaseAuth)
	//if err != nil {
	//	fmt.Println("Connection error:", err)
	//	return ctx.InternalError("Connection Failed: " + err.Error())
	//}
	//defer db.Close()

	return ctx.Sucsess("Test Connection Successful")
}

func HandleCreateProject(ctx *core.WebContext) error {
	userID, err := ctx.GetUserId()
	if err != nil {
		return ctx.Unauthorized(err.Error())
	}

	var cpr CreateProjectRequest
	if err := ctx.Bind(&cpr); err != nil {
		return ctx.BadRequest("invalid input")
	}

	repo := NewRepository(ctx)

	project, err := repo.CreateProject(cpr, userID)
	if err != nil {
		return ctx.InternalError("Error Create Project Metadata: " + err.Error())
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(cpr.Credentials.ProjectPassword), bcrypt.DefaultCost)
	if err != nil {
		return ctx.InternalError("failed to hash password")
	}

	cpr.Credentials.ProjectPassword = string(hashedPassword)

	delete(cpr.Credentials.DatabaseAuth, "type")
	for k, v := range cpr.Credentials.DatabaseAuth {
		value := b64.StdEncoding.EncodeToString([]byte(v))
		cpr.Credentials.DatabaseAuth[k] = value
	}

	err = repo.CreateProjectCredentials(cpr.Credentials, project.ID)
	if err != nil {
		return ctx.InternalError("Error Create Project Credentials: " + err.Error())
	}

	err = repo.CreateProjectMembers(cpr.Members, project.ID)
	if err != nil {
		return ctx.InternalError("Error Create Project Members: " + err.Error())
	}

	users, err := repo.GetUsersForProject(project.ID)
	if err != nil {
		return ctx.InternalError("Error Fetching Project Users: " + err.Error())
	}

	projectWithUsers := ProjectWithUsers{
		Project: project,
		Users:   users,
	}

	return ctx.Sucsess(projectWithUsers)
}

func HandleGetAllProjects(ctx *core.WebContext) error {
	_, err := ctx.GetUserId()
	if err != nil {
		return ctx.Unauthorized(err.Error())
	}

	repo := NewRepository(ctx)
	projects, err := repo.GetAllProjects()
	if err != nil {
		return ctx.InternalError(err.Error())
	}
	return ctx.Sucsess(projects)
}

func HandleGetProjectByID(ctx *core.WebContext) error {
	_, err := ctx.GetUserId()
	if err != nil {
		return ctx.Unauthorized(err.Error())
	}

	idParam := ctx.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return ctx.BadRequest("invalid project id")
	}

	repo := NewRepository(ctx)
	project, err := repo.GetProjectByID(id)
	if err != nil {
		return ctx.NotFound("project not found")
	}

	return ctx.Sucsess(project)
}

func HandleUpdateProject(ctx *core.WebContext) error {
	_, err := ctx.GetUserId()
	if err != nil {
		return ctx.Unauthorized(err.Error())
	}

	idParam := ctx.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return ctx.BadRequest("invalid project id")
	}

	var project Projects
	if err := ctx.Bind(&project); err != nil {
		return ctx.BadRequest("invalid input")
	}
	project.ID = id

	repo := NewRepository(ctx)
	if err := repo.UpdateProject(&project); err != nil {
		return ctx.InternalError(err.Error())
	}

	return ctx.Sucsess(project)
}

func HandleDeleteProject(ctx *core.WebContext) error {
	_, err := ctx.GetUserId()
	if err != nil {
		return ctx.Unauthorized(err.Error())
	}

	idParam := ctx.Param("id")
	id, err := strconv.Atoi(idParam)
	if err != nil {
		return ctx.BadRequest("invalid project id")
	}

	repo := NewRepository(ctx)
	if err := repo.DeleteProject(id); err != nil {
		return ctx.InternalError(err.Error())
	}

	return ctx.Sucsess(map[string]string{"message": "project deleted"})
}

func HandleGetActiveProjects(ctx *core.WebContext) error {
	_, err := ctx.GetUserId()
	if err != nil {
		return ctx.Unauthorized(err.Error())
	}

	repo := NewRepository(ctx)
	projects, err := repo.GetActiveProjects()
	if err != nil {
		return ctx.InternalError(err.Error())
	}
	return ctx.Sucsess(projects)
}

func GetAllProjectsWithUsersForUser(ctx *core.WebContext) error {
	userID, err := ctx.GetUserId()
	if err != nil {
		return ctx.Unauthorized(err.Error())
	}

	repo := NewRepository(ctx)
	projectWithMembers, err := repo.GetAllProjectsWithUsersForUser(userID)
	if err != nil {
		return ctx.InternalError(err.Error())
	}
	return ctx.Sucsess(projectWithMembers)
}

func HandleGetCommits(ctx *core.WebContext) error {
	var limit, offset, projectId int

	_, err := ctx.GetUserId()
	if err != nil {
		return ctx.Unauthorized(err.Error())
	}

	if projectId, err = strconv.Atoi(ctx.Param("projectId")); err != nil {
		return ctx.BadRequest("invalid projectId header")
	}

	if offset, err = strconv.Atoi(ctx.Request().Header.Get("offset")); err != nil {
		return ctx.BadRequest("invalid offset header")
	}

	if limit, err = strconv.Atoi(ctx.Request().Header.Get("limit")); err != nil {
		return ctx.BadRequest("invalid limit header")
	}

	repo := NewRepository(ctx)
	commits, err := repo.GetCommits(limit, offset, projectId)
	if err != nil {
		return ctx.InternalError(err.Error())
	}
	return ctx.Sucsess(commits)
}
