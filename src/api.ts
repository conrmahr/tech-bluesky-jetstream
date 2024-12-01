import Fastify from "fastify";
import {
  constructFeed,
  parseCursor,
  stackOverflowTags,
} from "./lib/feed.js";
import { db } from "./lib/db.js";

const server = Fastify({
  logger: true,
});

// Tell Bluesky about the feed
server.route({
  method: "GET",
  url: "/.well-known/did.json",
  handler: async (_, res) => {
    res.send({
      "@context": ["https://www.w3.org/ns/did/v1"],
      id: process.env.PUBLISHER_DID,
      service: [
        {
          id: "#bsky_fg",
          serviceEndpoint: `https://${process.env.HOSTNAME ?? "localhost"}`,
          type: "BskyFeedGenerator",
        },
      ],
    });
  },
});

// Define the feeds we support
server.route({
  method: "GET",
  url: "/xrpc/app.bsky.feed.describeFeedGenerator",
  handler: async (_, res) => {
    res.send({
      did: process.env.PUBLISHER_DID,
      feeds: [
        { uri: `at://${process.env.PUBLISHER_DID}/app.bsky.feed.generator/${process.env.FEED_NAME}` },
      ],
    });
  },
});

// Construct the feed
server.route({
  method: "GET",
  url: "/xrpc/app.bsky.feed.getFeedSkeleton",
  handler: async (req, res) => {

    const query = req.query as {
      feed: string;
      cursor?: string;
      limit: string;
    };
    const limit = parseInt(query.limit);
    const cursor = query.cursor ? parseCursor(query.cursor) : undefined;

    switch (query.feed) {
      case `at://${process.env.PUBLISHER_DID}/app.bsky.feed.generator/${process.env.FEED_NAME}` : {
        const { items, cursor: newCursor } = await stackOverflowTags({
          limit,
          cursor,
        });

        res.send({ feed: constructFeed(items), cursor: newCursor });
        return;
      }
      default: {
        res.code(404).send();
      }
    }
  },
});

// Get all the posts data
server.route({
  method: "GET",
  url: "/dump",
  handler: async (_, res) => {
    res.send({
      posts: db.prepare(`SELECT * FROM post`).all(),
    });
  },
});

const listen = process.env.LISTEN_HOST ?? "localhost";
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

server.listen({ port, host: listen }).then(() => {
  console.log(`Server listening on port ${port}`);
});
