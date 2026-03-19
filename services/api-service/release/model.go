package release

import "time"

type Release struct {
	ID             int        `db:"id" json:"id"`
	Notes          string     `db:"notes" json:"notes"`
	ProjectID      int        `db:"project_id" json:"projectId"`
	CurrentVersion int        `db:"current_version" json:"currentVersion"`
	CreatedAt      *time.Time `db:"created_at" json:"createdAt,omitempty"`
	CreatedBy      int        `db:"created_by" json:"createdBy"`
	Approved       bool       `db:"approved" json:"approved"`
	ApprovedAt     *time.Time `db:"approved_at" json:"approvedAt,omitempty"`
	ApprovedBy     *int       `db:"approved_by" json:"approvedBy,omitempty"`
	Released       bool       `db:"released" json:"released"`
	ReleasedAt     *time.Time `db:"released_at" json:"releasedAt,omitempty"`
	ReleasedBy     *int       `db:"released_by" json:"releasedBy,omitempty"`
}
