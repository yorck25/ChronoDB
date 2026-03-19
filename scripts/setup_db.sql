CREATE TABLE users
(
    id         SERIAL PRIMARY KEY,
    first_name VARCHAR(128),
    last_name VARCHAR(255) default '',
    email      VARCHAR(128) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    active     bool      DEFAULT true,
    terms_accepted bool DEFAULT false
);

CREATE TABLE user_login
(
    user_id         INT REFERENCES users (id),
    username        VARCHAR(50) UNIQUE NOT NULL,
    password_hash   VARCHAR(255)       NOT NULL,
    last_login_at   TIMESTAMP,
    failed_attempts INT
);


CREATE TABLE connection_types
(
    id          SERIAL PRIMARY KEY,
    type_name   VARCHAR(50) UNIQUE NOT NULL,
    key         VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    active      bool DEFAULT true
);

CREATE TABLE projects
(
    id              SERIAL PRIMARY KEY,
    owner_id        INT REFERENCES users (id),
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    created_at      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    active          bool        DEFAULT true,
    visibility      VARCHAR(50) DEFAULT 'private'
        CONSTRAINT visibility_check CHECK (visibility IN ('private', 'public', 'internal')),
    connection_type INT REFERENCES connection_types (id)
);

CREATE TABLE projects_credentials (
                                      project_id int REFERENCES projects (id) ON DELETE CASCADE,
                                      project_password varchar(255),
                                      database_auth jsonb not null,
                                      updates_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE versions
(
    id         SERIAL PRIMARY KEY,
    version    varchar(50) NOT NULL,
    up         jsonb,
    down       jsonb,
    state      varchar(128)
        CONSTRAINT state_check CHECK (state IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_at TIMESTAMP,
    project_id INT REFERENCES projects (id)
);

CREATE TABLE version_audit
(
    id         SERIAL PRIMARY KEY,
    version_id INT REFERENCES versions (id),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    applied_by INT REFERENCES users (id),
    notes      varchar(512)
);

CREATE TABLE user_role
(
    id         SERIAL PRIMARY KEY,
    user_id    INT REFERENCES users (id),
    project_id INT REFERENCES projects (id),
    role       varchar(255)
);

CREATE TABLE releases
(
    id              SERIAL PRIMARY KEY,
    notes           TEXT,
    project_id      INT REFERENCES projects (id),
    current_version INT REFERENCES versions (id),
    created_at      TIMESTAMP,
    created_by      INT REFERENCES users (id),
    approved        bool DEFAULT false,
    approved_at     TIMESTAMP,
    approved_by     INT REFERENCES users (id),
    released        bool default false,
    released_at     TIMESTAMP,
    released_by     INT REFERENCES users (id)
);



-- DUMMY DATA INSERTS

-- ✅ connection_types
INSERT INTO connection_types (type_name, key, description)
VALUES ('PostgreSQL', 'psql', 'PostgreSQL Database Connection'),
       ('MySQL', 'mysql', 'MySQL Database Connection'),
       ('SQLite', 'sqlite', 'Lightweight local SQLite database'),
       ('MsSQL', 'mssql', 'Microsoft SQL database');

-- ✅ users
INSERT INTO users (first_name, last_name, email, active)
VALUES ('Alice', 'test','alice@example.com', true),
       ('Bob', 'test','bob@example.com', true),
       ('Charlie','test', 'charlie@example.com', false),
       ('Diana', 'test','diana@example.com', true);

-- ✅ user_login
INSERT INTO user_login (user_id, username, password_hash, last_login_at, failed_attempts)
VALUES (1, 'alice_dev', 'hashed_password_1', NOW() - INTERVAL '1 day', 0),
       (2, 'bob_admin', 'hashed_password_2', NOW() - INTERVAL '3 hours', 1),
       (3, 'charlie_ops', 'hashed_password_3', NOW() - INTERVAL '10 days', 2),
       (4, 'diana_owner', 'hashed_password_4', NOW() - INTERVAL '5 hours', 0);

-- ✅ projects
INSERT INTO projects (owner_id, name, description, visibility, connection_type)
VALUES (1, 'Analytics Platform', 'A data analytics web application.', 'public', 1),
       (2, 'E-commerce Backend', 'Backend API for online store.', 'private', 2),
       (3, 'IoT Dashboard', 'Real-time dashboard for IoT devices.', 'internal', 3),
       (4, 'DB Versioning Tool', 'A tool to manage database schema versions and migrations.', 'public', 1);

-- ✅ versions
INSERT INTO versions (version, up, down, state, applied_at, project_id)
VALUES ('v1.0.0', '{
  "migrate": "create tables"
}', '{
  "rollback": "drop tables"
}', 'completed', NOW() - INTERVAL '10 days', 1),
       ('v1.1.0', '{
         "migrate": "add analytics views"
       }', '{
         "rollback": "drop views"
       }', 'completed', NOW() - INTERVAL '5 days', 1),
       ('v1.0.0', '{
         "migrate": "init ecommerce schema"
       }', '{
         "rollback": "drop ecommerce schema"
       }', 'completed', NOW() - INTERVAL '20 days', 2),
       ('v1.0.1', '{
         "migrate": "add payment table"
       }', '{
         "rollback": "drop payment table"
       }', 'pending', NULL, 2),
       ('v0.9.0', '{
         "migrate": "create sensors table"
       }', '{
         "rollback": "drop sensors"
       }', 'failed', NOW() - INTERVAL '15 days', 3);

-- ✅ version_audit
INSERT INTO version_audit (version_id, applied_at, applied_by, notes)
VALUES (1, NOW() - INTERVAL '9 days', 1, 'Initial migration applied successfully.'),
       (2, NOW() - INTERVAL '4 days', 2, 'Added new analytics views.'),
       (3, NOW() - INTERVAL '19 days', 2, 'Initial schema setup for e-commerce.'),
       (5, NOW() - INTERVAL '14 days', 3, 'Migration failed due to missing column.');

-- ✅ user_role
INSERT INTO user_role (user_id, project_id, role)
VALUES (1, 1, 'Owner'),
       (2, 1, 'Contributor'),
       (2, 2, 'Owner'),
       (3, 3, 'Owner'),
       (4, 4, 'Owner'),
       (1, 4, 'Maintainer');

-- ✅ releases
INSERT INTO releases (notes, project_id, current_version, created_at, created_by, approved, approved_at, approved_by,
                      released, released_at, released_by)
VALUES ('Initial release of Analytics Platform.', 1, 2, NOW() - INTERVAL '3 days', 1, true,
        NOW() - INTERVAL '2 days', 2, true, NOW() - INTERVAL '1 day', 1),
       ('E-commerce Backend v1.0.1 Release', 2, 4, NOW() - INTERVAL '1 day', 2, false, NULL, NULL, false, NULL,
        NULL),
       ('Update of Analytics Platform.', 1, 2, NOW() - INTERVAL '3 days', 1, true,
        NOW() - INTERVAL '2 days', 2, false, NULL, NULL);
