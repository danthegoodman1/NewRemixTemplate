
-- +migrate Up
create table users (
  id text not null,
  slug text,
  name text not null,
  email text unique not null,

  google_scopes text[] default '{}',
  twitch_scopes text[] default '{}',
  refresh_token text,

  platforms text[] not null,

  created_ms int8 not null,

  primary key (id)
) strict without rowid
;
create index on users (email);
create index on users (slug) where slug is not null;

-- +migrate Down
drop table users;
