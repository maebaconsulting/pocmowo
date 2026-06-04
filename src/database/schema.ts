// Schéma relationnel MoWoBank (SQLite). Le DDL ci-dessous est appliqué au démarrage
// en mode desktop. La structure reflète une définition de type Drizzle (cf. specs §7.2).

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  role          TEXT NOT NULL CHECK (role IN ('admin','agent')),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS clients (
  id          TEXT PRIMARY KEY,
  full_name   TEXT NOT NULL,
  phone       TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  gender      TEXT NOT NULL DEFAULT 'M' CHECK (gender IN ('M','F')),
  birth_date  TEXT NOT NULL DEFAULT '',
  occupation  TEXT NOT NULL DEFAULT '',
  id_type     TEXT NOT NULL DEFAULT 'cni' CHECK (id_type IN ('cni','passeport','permis')),
  id_number   TEXT NOT NULL DEFAULT '',
  address     TEXT NOT NULL DEFAULT '',
  city        TEXT NOT NULL DEFAULT '',
  kyc_status  TEXT NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending','verified','rejected')),
  created_by  TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id           TEXT PRIMARY KEY,
  number       TEXT NOT NULL UNIQUE,
  client_id    TEXT NOT NULL DEFAULT '',
  holder_name  TEXT NOT NULL,
  holder_phone TEXT NOT NULL DEFAULT '',
  type         TEXT NOT NULL CHECK (type IN ('epargne','courant','tontine')),
  balance      INTEGER NOT NULL DEFAULT 0,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','frozen','closed')),
  opened_by    TEXT NOT NULL,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id            TEXT PRIMARY KEY,
  account_id    TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('deposit','withdrawal')),
  amount        INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  label         TEXT NOT NULL DEFAULT '',
  performed_by  TEXT NOT NULL,
  created_at    TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE INDEX IF NOT EXISTS idx_tx_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_tx_created ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_acc_client ON accounts(client_id);
`;
