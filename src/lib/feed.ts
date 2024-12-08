import dayjs from 'dayjs';
import { db, PostWithData } from "./db.js";

export function parseCursor(cursor: string | undefined) {
  if (!cursor) {
    return { time: undefined, index: undefined };
  }

  const [time, index] = cursor.split("/");
  return { time, index: parseInt(index || "0") };
}

export type ParsedCursor = ReturnType<typeof parseCursor>;

export interface TagOptions {
  limit: number;
  cursor?: ParsedCursor;
  range?: string;
}

export async function getPosts({
  limit,
  cursor = { time: undefined, index: undefined },
  range = "1 day",
}: TagOptions) {
  const cursorTime = cursor.time || "now";
  const cursorDateTime = `DATETIME('${cursorTime}', '-${range}')`;

  const posts = db
    .prepare(
      `
      SELECT
        did,
        rkey,
        createdAt
      FROM
        post
      WHERE
        createdAt >= ${cursorDateTime}
      ORDER BY
        createdAt DESC
      LIMIT
        ${limit}
        ${cursor.index ? `OFFSET ${cursor.index}` : ""};
      `
    )
    .all() as PostWithData[];

  return {
    items: posts,
    cursor: `${cursor.time || dayjs().format('YYYY-MM-DD HH:mm:ss')}/${
      (cursor.index || 0) + (posts.length === limit ? limit : posts.length)
    }`,
  };
}

export function constructFeed(items: PostWithData[]) {
  return items.map((post) => {
    return {
      post: `at://${post.did}/app.bsky.feed.post/${post.rkey}`,
    };
  });
}

export async function stackOverflowTags(options: Omit<TagOptions, "range">) {
  return getPosts({ ...options, range: "1 day" });
}