package user

import "time"

type User struct {
	ID            int       `json:"id" db:"id"`
	FirstName     string    `json:"firstName" db:"first_name"`
	LastName      string    `json:"lastName" db:"last_name"`
	Email         string    `json:"email" db:"email"`
	CreatedAt     time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt     time.Time `json:"updatedAt" db:"updated_at"`
	Active        bool      `json:"active" db:"active"`
	TermsAccepted bool      `json:"termsAccepted" db:"terms_accepted"`
}

type UserLogin struct {
	UserID         int        `json:"userId" db:"user_id"`
	Username       string     `json:"username" db:"username"`
	PasswordHash   string     `json:"-" db:"password_hash"`
	LastLoginAt    *time.Time `json:"lastLoginAt" db:"last_login_at"`
	FailedAttempts int        `json:"failedAttempts" db:"failed_attempts"`
}

type RegisterRequest struct {
	FirstName     string `json:"firstName" db:"first_name" binding:"required"`
	LastName      string `json:"lastName" db:"last_name" binding:"required"`
	Email         string `json:"email" db:"email" binding:"required,email"`
	Username      string `json:"username" db:"username" binding:"required,min=3,max=50"`
	Password      string `json:"password" db:"password" binding:"required,min=8"`
	TermsAccepted bool   `json:"termsAccepted" db:"terms_accepted"`
}

type LoginRequest struct {
	Username string `json:"username" db:"username" binding:"required"`
	Password string `json:"password" db:"password" binding:"required"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"oldPassword" db:"old_password" binding:"required"`
	NewPassword string `json:"newPassword" db:"new_password" binding:"required,min=8"`
}

type ResetPasswordRequest struct {
	Email string `json:"email" db:"email" binding:"required,email"`
}

type UpdateProfileRequest struct {
	FirstName *string `json:"firstName" db:"first_name"`
	LastName  *string `json:"lastName" db:"last_name"`
	Email     *string `json:"email" db:"email" binding:"omitempty,email"`
}

type AuthResponse struct {
	Token string `json:"token" db:"token"`
	User  User   `json:"user" db:"user"`
}

type MessageResponse struct {
	Message string `json:"message" db:"message"`
}

type MemberRequest struct {
	ID        int    `json:"id" db:"id"`
	FirstName string `json:"firstName" db:"first_name"`
	LastName  string `json:"lastName" db:"last_name"`
	Username  string `json:"username" db:"username"`
	Email     string `json:"email" db:"email"`
	Active    bool   `json:"active" db:"active"`
}
