
-- +migrate Up
create table users (
  id text not null,
  slug text,
  name text not null,
  email text unique not null,

  auth jsonb not null default '{}'::jsonb,

  created_ms int8 not null,

  primary key (id)
)
;
create index on users (email);
create index on users (slug) where slug is not null;

-- +migrate Down
drop table users;
