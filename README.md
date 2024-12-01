# Tech Bluesky 💻

This repo contains the code for the Tech Bluesky 💻 feed that was forked from [hipstersmoothie/bsky-lnks](https://github.com/hipstersmoothie/bsky-lnks).

## Feed

- [Tech Bluesky 💻](https://bsky.app/profile/did:plc:gzymh5fce2h7hvjm7vsqh2l4/feed/tech-bluesky) - Every post with a https://survey.stackoverflow.co/2024/technology/ keyword hashtag, along with variations of #TechBluesky.

## Algorithm

The feed uses the following strategy to filter posts:

#️⃣ Post has one or more keyword defined in `src/lib/constants.ts` in hashtag form
⏭︎ Ignore replies and non-English posts
🧼 Scrub special characters `., !, ?, -` that might be apart of the hashtag
🕛 Posts created in the last 24 hours

## Thanks

[@hipstersmoothie](https://github.com/hipstersmoothie)<br />
[@chapel](https://github.com/chapel)