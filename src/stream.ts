import { Jetstream } from "@skyware/jetstream";
import WebSocket from "ws";

import { addPost } from "./lib/db.js";
import keywords from "./lib/constants.js";

const jetstream = new Jetstream({
  ws: WebSocket,
  wantedCollections: [
    "app.bsky.feed.post",
  ],
});

jetstream.onCreate("app.bsky.feed.post", async (event) => {
  // Ignore replies, non-English, and empty posts
  if (event.commit.record.reply || !event.commit.record.langs?.some((l) => l === "en") || !event.commit.record.text) {
    return;
  }
  // Scrub passed characters
  function removeSpecialChars(text: string, specialChars: string[]) {
    return specialChars.reduce((acc, char) => acc.replaceAll(char, ''), text)
  }  

  // Return posts that have at least one keyword with #
  function includesHashTag(cleanText: string, tags: string[]) {
    return tags.some((word) => {
      return cleanText.toLowerCase().split(' ').includes(`#${word.toLowerCase()}`)
    })
  }

  // Run the algo 
  const getPost = includesHashTag(removeSpecialChars(event.commit.record.text, ['.', '!', '?', '-']), keywords);

  // Check if post returns and add it to the db
  if (getPost) {
    console.log(event.commit.record.text);
    addPost({ event });
  }

});

jetstream.start();
