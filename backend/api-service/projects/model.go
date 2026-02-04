package projects

import (
	"backend/databaseWorker"
	"time"
)

type Projects struct {
	ID             int       `db:"id" json:"id"`
	OwnerID        int       `db:"owner_id" json:"ownerId"`
	Name           string    `db:"name" json:"name"`
	Description    string    `db:"description" json:"description"`
	CreatedAt      time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt      time.Time `db:"updated_at" json:"updatedAt"`
	Active         bool      `db:"active" json:"active"`
	Visibility     string    `db:"visibility" json:"visibility"`
	ConnectionType int       `db:"connection_type" json:"connectionType"`
}

type CreateProjectRequest struct {
	Metadata    CreateProjectMetadataRequest    `json:"metadata"`
	Credentials CreateProjectCredentialsRequest `json:"credentials"`
	Members     CreateProjectMembersRequest     `json:"members"`
}

type CreateProjectMetadataRequest struct {
	Name           string `db:"name" json:"name"`
	Description    string `db:"description" json:"description"`
	Visibility     string `db:"visibility" json:"visibility"`
	ConnectionType int    `db:"connection_type" json:"connectionType"`
}

type CreateProjectCredentialsRequest struct {
	ProjectPassword string            `json:"projectPassword"`
	DatabaseAuth    map[string]string `json:"databaseAuth"`
}

type CreateProjectMembersRequest struct {
	Members []int `json:"members"`
}

type UsersForProjectResponse struct {
	FirstFiveMembers []string `json:"firstFiveMembers"`
	TotalCount       int      `json:"totalCount"`
}

type ProjectWithUsers struct {
	Project Projects                `json:"project"`
	Users   UsersForProjectResponse `json:"users"`
}

type CommitRequestWithCount struct {
	Commits    []databaseWorker.SchemaCommit `json:"commits"`
	TotalCount int64                         `json:"totalCount"`
}
