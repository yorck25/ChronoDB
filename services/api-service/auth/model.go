package auth

import "github.com/dgrijalva/jwt-go"

type User struct {
	Id       int    `json:"id" db:"id"`
	Name     string `json:"name" db:"name"`
	Lastname string `json:"lastname" db:"lastname"`
	Username string `json:"username" db:"username"`
	Email    string `json:"email" db:"email"`
	Password string `json:"password" db:"password"`
	Deleted  string `json:"deleted" db:"deleted"`
}

type UserClaims struct {
	UserId int `json:"userId"`
	jwt.StandardClaims
}
