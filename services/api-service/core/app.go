package core

import (
	"fmt"
	"github.com/labstack/echo/v4"
	"github.com/labstack/gommon/log"
	"net/http"
	"strconv"

	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

type App struct {
	*echo.Echo
	Ctx *AppContext
}

func InitApp() (*App, error) {
	ctx := &AppContext{}

	config, err := LoadConfig()
	if err != nil {
		return nil, err
	}

	ctx.config = config

	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		config.PsqlHost, strconv.Itoa(config.PsqlPort), config.PsqlUser, config.PsqlPassword, config.PsqlDatabase,
	)

	db, err := sqlx.Connect("postgres", connStr)
	if err != nil {
		return nil, err
	}
	ctx.db = db

	err = db.Ping()
	if err != nil {
		log.Fatalf("Cannot reach the database: %v", err)
	}

	fmt.Println("✅ Successfully connected to PostgreSQL!")

	e := echo.New()
	e.Debug = true
	e.Logger.SetLevel(log.DEBUG)
	e.Use(CreateCtx(ctx))

	return &App{Echo: e, Ctx: ctx}, nil
}

type HandlerFunc func(*WebContext) error

func (f HandlerFunc) Handle(ctx *WebContext) error {
	return f(ctx)
}

func wrapHandler(h HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.(*WebContext)
		return h.Handle(ctx)
	}
}

func (a *App) Group(prefix string, m ...echo.MiddlewareFunc) *Group {
	g := a.Echo.Group(prefix, m...)
	return &Group{Group: g}
}

type Group struct {
	*echo.Group
}

func (g *Group) GET(path string, h HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route {
	return g.Add(http.MethodGet, path, wrapHandler(h), m...)
}

func (g *Group) POST(path string, h HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route {
	return g.Add(http.MethodPost, path, wrapHandler(h), m...)
}

func (g *Group) PUT(path string, h HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route {
	return g.Add(http.MethodPut, path, wrapHandler(h), m...)
}

func (g *Group) DELETE(path string, h HandlerFunc, m ...echo.MiddlewareFunc) *echo.Route {
	return g.Add(http.MethodDelete, path, wrapHandler(h), m...)
}
