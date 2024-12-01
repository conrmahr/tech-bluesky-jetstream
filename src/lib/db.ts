import { CommitCreateEvent } from "@skyware/jetstream";
import Database from "libsql";

const dbPath = process.env.DB_URL || "./local.db";

export const db = new Database(dbPath);

// Allows the other process to read from the database while we're writing to it
db.exec("PRAGMA journal_mode = WAL;");

db.prepare(
  `CREATE TABLE IF NOT EXISTS post (
    did TEXT NOT NULL, 
    rkey TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    text TEXT NOT NULL,
    PRIMARY KEY (did, rkey)
  )`
).run();

export interface Post {
  did: string;
  rkey: string;
  createdAt: string;
}

export interface PostWithData extends Post {
  dateWritten: string;
}

export function addPost(data: {
  event: CommitCreateEvent<"app.bsky.feed.post">;
}) {
  const result = db
    .prepare(
      `INSERT OR REPLACE INTO post (did, rkey, text) VALUES (?, ?, ?)`
    )
    .run(data.event.did, data.event.commit.rkey, data.event.commit.record.text);

  console.log("ADD POST", result);
}
