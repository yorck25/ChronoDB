package auth

import (
	"backend/common"
	"github.com/dgrijalva/jwt-go"
	"time"
)

func CreateToken(userId int, config *common.Config) (string, error) {
	claims := &UserClaims{
		UserId: userId,
		StandardClaims: jwt.StandardClaims{
			IssuedAt:  time.Now().Unix(),
			ExpiresAt: time.Now().Add(48 * time.Hour).Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(config.JwtSecretKey)
}

func DecodeToken(tokenString string, jwtSecret []byte) (int, error) {
	claims := UserClaims{}

	_, err := jwt.ParseWithClaims(tokenString, &claims, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})

	if err != nil {
		return 0, err
	}

	return claims.UserId, nil
}
