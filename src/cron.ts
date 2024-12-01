import { CronJob } from "cron";
import { db } from "./lib/db.js";

// Delete old data every hour
CronJob.from({
  start: true,
  cronTime: "0 * * * *",
  onTick: () => {
    // Delete posts older than 1 day
    const deletePosts = db.prepare(
      `
        DELETE FROM post
        WHERE createdAt < DATETIME('now', '-2 day');
      `
    );

    console.log("DELETE POSTS", deletePosts.run());
  },
});
