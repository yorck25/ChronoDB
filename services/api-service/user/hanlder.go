package user

import (
	"backend/auth"
	"backend/core"
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func HandleRegister(ctx *core.WebContext) error {
	var req RegisterRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.BadRequest("invalid input")
	}

	repo := NewRepository(ctx)

	emailExists, err := repo.CheckEmailExists(req.Email)
	if err != nil {
		return ctx.InternalError("failed to check email")
	}
	if emailExists {
		return ctx.BadRequest("email already registered")
	}

	usernameExists, err := repo.CheckUsernameExists(req.Username)
	if err != nil {
		return ctx.InternalError("failed to check username")
	}
	if usernameExists {
		return ctx.BadRequest("username already taken")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return ctx.InternalError("failed to hash password")
	}

	user, err := repo.CreateUser(req.FirstName, req.LastName, req.Email, req.TermsAccepted)
	if err != nil {
		fmt.Println(err)
		return ctx.InternalError("failed to create user")
	}

	err = repo.CreateUserLogin(user.ID, req.Username, string(hashedPassword))
	if err != nil {
		return ctx.InternalError("failed to create login credentials")
	}

	token, err := auth.CreateToken(user.ID, ctx.GetConfig())
	if err != nil {
		return ctx.InternalError("failed to generate token")
	}

	return ctx.Sucsess(AuthResponse{
		Token: token,
		User:  *user,
	})
}

func HandleLogin(ctx *core.WebContext) error {
	var req LoginRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.BadRequest("invalid input")
	}

	repo := NewRepository(ctx)

	userLogin, err := repo.GetUserLoginByUsername(req.Username)
	if err != nil {
		return ctx.BadRequest("invalid credentials")
	}

	if userLogin.FailedAttempts >= 5 {
		return ctx.BadRequest("account locked due to too many failed attempts")
	}

	err = bcrypt.CompareHashAndPassword([]byte(userLogin.PasswordHash), []byte(req.Password))
	if err != nil {
		repo.IncrementFailedAttempts(req.Username)
		return ctx.BadRequest("invalid credentials")
	}

	user, err := repo.GetUserByID(userLogin.UserID)
	if err != nil {
		return ctx.InternalError("login failed")
	}

	if !user.Active {
		return ctx.BadRequest("account is inactive")
	}

	err = repo.UpdateLastLogin(user.ID)
	if err != nil {
		fmt.Println("failed to update last login:", err)
	}

	token, err := auth.CreateToken(user.ID, ctx.GetConfig())
	if err != nil {
		return ctx.InternalError("failed to generate token")
	}

	return ctx.Sucsess(AuthResponse{
		Token: token,
		User:  *user,
	})
}

func HandleGetProfile(ctx *core.WebContext) error {
	userID, err := ctx.GetUserId()
	if err != nil {
		return ctx.Unauthorized(err.Error())
	}

	repo := NewRepository(ctx)
	user, err := repo.GetUserByID(userID)
	if err != nil {
		return ctx.NotFound("user not found")
	}

	return ctx.Sucsess(user)
}

func HandleUpdateProfile(ctx *core.WebContext) error {
	userID, err := ctx.GetUserId()
	if err != nil {
		return ctx.Unauthorized(err.Error())
	}

	var req UpdateProfileRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.BadRequest("invalid input")
	}

	repo := NewRepository(ctx)

	if req.Email != nil {
		emailExists, err := repo.CheckEmailExists(*req.Email)
		if err != nil {
			return ctx.InternalError("failed to check email")
		}
		if emailExists {
			currentUser, _ := repo.GetUserByID(userID)
			if currentUser != nil && currentUser.Email != *req.Email {
				return ctx.BadRequest("email already in use")
			}
		}
	}

	user, err := repo.UpdateUser(userID, req.FirstName, req.LastName, req.Email)
	if err != nil {
		return ctx.InternalError("failed to update profile")
	}

	return ctx.Sucsess(user)
}

func HandleChangePassword(ctx *core.WebContext) error {
	userID, err := ctx.GetUserId()
	if err != nil {
		return ctx.Unauthorized(err.Error())
	}

	var req ChangePasswordRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.BadRequest("invalid input")
	}

	repo := NewRepository(ctx)

	userLogin, err := repo.GetUserLoginByUserID(userID)
	if err != nil {
		return ctx.InternalError("failed to retrieve user credentials")
	}

	err = bcrypt.CompareHashAndPassword([]byte(userLogin.PasswordHash), []byte(req.OldPassword))
	if err != nil {
		return ctx.BadRequest("current password is incorrect")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return ctx.InternalError("failed to hash password")
	}

	err = repo.UpdatePassword(userID, string(hashedPassword))
	if err != nil {
		return ctx.InternalError("failed to update password")
	}

	return ctx.Sucsess(MessageResponse{
		Message: "password changed successfully",
	})
}

func HandleRequestPasswordReset(ctx *core.WebContext) error {
	var req ResetPasswordRequest
	if err := ctx.Bind(&req); err != nil {
		return ctx.BadRequest("invalid input")
	}

	repo := NewRepository(ctx)

	user, err := repo.GetUserByEmail(req.Email)
	if err != nil {
		return ctx.InternalError("failed to process request")
	}

	if user != nil {
		// TODO: Generate reset token and send email
		// token := generateResetToken()
		// saveResetToken(user.ID, token)
		// sendResetEmail(user.Email, token)
	}

	return ctx.Sucsess(MessageResponse{
		Message: "if the email exists, a password reset link has been sent",
	})
}

func HandleSearchMembers(ctx *core.WebContext) error {
	searchValue := ctx.QueryParam("query")
	repo := NewRepository(ctx)

	members, err := repo.SearchMembers(searchValue)
	if err != nil {
		return ctx.InternalError("failed to search members" + err.Error())
	}

	return ctx.Sucsess(members)
}
