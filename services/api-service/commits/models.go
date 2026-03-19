package commits

import "time"

type SchemaCommit struct {
	ID             int        `json:"id" db:"id"`
	ProjectID      int        `json:"projectId" db:"project_id"`
	Checksum       string     `json:"checksum" db:"checksum"`
	ParentChecksum *string    `json:"parentChecksum,omitempty" db:"parent_checksum"`
	ActionType     string     `json:"actionType" db:"action_type"`
	Title          string     `json:"title" db:"title"`
	Message        string     `json:"message" db:"message"`
	UpScript       string     `json:"upScript" db:"up_script"`
	DownScript     string     `json:"downScript" db:"down_script"`
	AuthorUserID   *int       `json:"authorUserId,omitempty" db:"author_user_id"`
	CreatedAt      time.Time  `json:"createdAt" db:"created_at"`
	DeletedAt      *time.Time `json:"deletedAt,omitempty" db:"deleted_at"`
}
