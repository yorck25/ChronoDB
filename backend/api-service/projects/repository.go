package projects

import (
	"backend/core"
	"backend/databaseWorker"
	"encoding/json"
	"fmt"
	"github.com/jmoiron/sqlx"
	"strings"
)

type Repository struct {
	db *sqlx.DB
}

func NewRepository(ctx *core.WebContext) *Repository {
	return &Repository{db: ctx.GetDb()}
}

func (r *Repository) GetAllProjects() ([]Projects, error) {
	var projects []Projects
	stmt, err := r.db.PrepareNamed(`SELECT * FROM projects ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}

	err = stmt.Select(&projects, map[string]any{})
	if err != nil {
		return nil, err
	}

	return projects, err
}

func (r *Repository) GetProjectByID(id int) ([]Projects, error) {
	var projects []Projects
	stmt, err := r.db.PrepareNamed(`SELECT * FROM projects WHERE id = :id ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}

	params := map[string]any{
		"id": id,
	}

	err = stmt.Select(&projects, params)
	if err != nil {
		return nil, err
	}

	return projects, err
}

func (r *Repository) GetActiveProjects() ([]Projects, error) {
	var projects []Projects
	stmt, err := r.db.PrepareNamed(`SELECT * FROM projects WHERE active = :active ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}

	params := map[string]any{
		"active": true,
	}

	err = stmt.Select(&projects, params)
	if err != nil {
		return nil, err
	}

	return projects, err
}

func (r *Repository) CreateProject(cpr CreateProjectRequest, ownerID int) (Projects, error) {
	var project Projects

	stmt, err := r.db.PrepareNamed(`
		INSERT INTO projects (owner_id, name, description, created_at, updated_at, active, visibility, connection_type)
		VALUES (:owner_id, :name, :description, NOW(), NOW(), :active, :visibility, :connection_type)
		RETURNING *`)
	if err != nil {
		return project, err
	}

	params := map[string]any{
		"owner_id":        ownerID,
		"name":            cpr.Metadata.Name,
		"description":     cpr.Metadata.Description,
		"active":          true,
		"visibility":      cpr.Metadata.Visibility,
		"connection_type": cpr.Metadata.ConnectionType,
	}

	err = stmt.Get(&project, params)
	if err != nil {
		return project, err
	}
	return project, err
}

func (r *Repository) CreateProjectCredentials(cpcr CreateProjectCredentialsRequest, projectID int) error {
	jsonData, err := json.Marshal(cpcr.DatabaseAuth)
	if err != nil {
		return err
	}

	stmt, err := r.db.PrepareNamed(`
		INSERT INTO projects_credentials (project_id, project_password, database_auth)
		VALUES (:projectID, :projectPassword, :databaseAuth)`)
	if err != nil {
		return err
	}

	params := map[string]any{
		"projectID":       projectID,
		"projectPassword": cpcr.ProjectPassword,
		"databaseAuth":    jsonData,
	}

	_, err = stmt.Exec(params)
	return err

	return nil
}

func (r *Repository) CreateProjectMembers(cpmr CreateProjectMembersRequest, projectID int) error {
	if len(cpmr.Members) == 0 {
		return nil
	}

	valueStrings := make([]string, 0, len(cpmr.Members))
	valueArgs := make([]interface{}, 0, len(cpmr.Members)*3)

	for i, memberID := range cpmr.Members {
		valueStrings = append(valueStrings, fmt.Sprintf("($%d, $%d, $%d)", i*3+1, i*3+2, i*3+3))
		valueArgs = append(valueArgs, memberID, projectID, nil)
	}

	stmt := fmt.Sprintf(`
		INSERT INTO user_role (user_id, project_id, role)
		VALUES %s
	`, strings.Join(valueStrings, ","))

	_, err := r.db.Exec(stmt, valueArgs...)
	return err
}

func (r *Repository) UpdateProject(p *Projects) error {
	stmt, err := r.db.PrepareNamed(`
		UPDATE projects
		SET name = :name,
			description = :description,
			updated_at = NOW(),
			active = :active,
			visibility = :visibility,
			connection_type = :connection_type
		WHERE id = :id`)
	if err != nil {
		return err
	}

	params := map[string]any{
		"id":              p.ID,
		"name":            p.Name,
		"description":     p.Description,
		"active":          p.Active,
		"visibility":      p.Visibility,
		"connection_type": p.ConnectionType,
	}

	_, err = stmt.Exec(params)
	return err
}

func (r *Repository) DeleteProject(id int) error {
	stmt, err := r.db.PrepareNamed(`DELETE FROM projects WHERE id = :id`)
	if err != nil {
		return err
	}

	params := map[string]any{
		"id": id,
	}

	_, err = stmt.Exec(params)
	return err
}

func (r *Repository) GetUsersForProject(projectID int) (UsersForProjectResponse, error) {
	var response UsersForProjectResponse

	rows, err := r.db.NamedQuery(`
		SELECT ul.username
		FROM users u
		JOIN user_login ul ON u.id = ul.user_id
		JOIN user_role ur ON u.id = ur.user_id
		WHERE ur.project_id = :projectID
		ORDER BY ul.username ASC
	`, map[string]any{"projectID": projectID})
	if err != nil {
		return response, err
	}
	defer rows.Close()

	var usernames []string
	for rows.Next() {
		var username string
		if err := rows.Scan(&username); err != nil {
			return response, err
		}
		usernames = append(usernames, username)
	}

	response.TotalCount = len(usernames)
	if len(usernames) > 5 {
		response.FirstFiveMembers = usernames[:5]
	} else {
		response.FirstFiveMembers = usernames
	}

	return response, nil
}

func (r *Repository) GetAllProjectsWithUsersForUser(userID int) ([]ProjectWithUsers, error) {
	var projects []Projects

	stmt, err := r.db.PrepareNamed(`
		SELECT p.*
		FROM projects p
		JOIN user_role ur ON p.id = ur.project_id
		WHERE ur.user_id = :userID
		ORDER BY p.created_at DESC
	`)

	if err != nil {
		return nil, err
	}

	params := map[string]any{
		"userID": userID,
	}

	err = stmt.Select(&projects, params)
	if err != nil {
		return nil, err
	}

	results := make([]ProjectWithUsers, 0, len(projects))
	for _, p := range projects {
		users, err := r.GetUsersForProject(p.ID)
		if err != nil {
			return nil, err
		}
		results = append(results, ProjectWithUsers{
			Project: p,
			Users:   users,
		})
	}

	return results, nil
}

func (r *Repository) GetCommits(limit int, offset int, projectId int) ([]databaseWorker.SchemaCommit, error) {
	var commits []databaseWorker.SchemaCommit

	stmt, err := r.db.PrepareNamed(`
		SELECT *
		FROM schema_commits
		WHERE project_id = :projectId
		ORDER BY created_at
		OFFSET :offset LIMIT :limit
	`)

	if err != nil {
		return nil, err
	}

	params := map[string]any{
		"limit":     limit,
		"offset":    offset,
		"projectId": projectId,
	}

	err = stmt.Select(&commits, params)
	if err != nil {
		return nil, err
	}

	return commits, err
}

func (r *Repository) GetCommitCount(projectId int) (int64, error) {
	var count int64

	stmt, err := r.db.PrepareNamed(`
		SELECT COUNT(*)
		FROM schema_commits
		WHERE project_id = :projectId;
	`)

	if err != nil {
		return 0, err
	}

	params := map[string]any{
		"projectId": projectId,
	}

	err = stmt.Get(&count, params)
	if err != nil {
		return 0, err
	}

	return count, err
}
