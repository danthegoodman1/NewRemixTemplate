
-- +migrate Up
create table workflows (
  id text not null,
  name text not null,
  metadata text,
  status text not null,
  created_ms int8 not null,
  updated_ms int8 not null,
  primary key(id)
) strict without rowid
;

create table workflow_tasks (
  workflow text not null,
  task_name text not null,
  seq int8 not null,
  status text not null,
  data text,
  return text,
  error text,
  created_ms int8 not null,
  updated_ms int8 not null,
  primary key (workflow, seq)
) strict without rowid
;

-- +migrate Down
drop table workflows;
drop table workflow_tasks;
