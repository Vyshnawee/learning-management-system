// Works out how to show an instructor's video link safely.
// We only embed YouTube and Vimeo, or play direct video files. Anything else becomes a plain link.
export const getVideoSource = (rawUrl) => {
     let url;
     try {
          url = new URL(rawUrl);
     } catch {
          return { type: "none" };
     }
     if (!["http:", "https:"].includes(url.protocol)) return { type: "none" };

     const host = url.hostname.replace(/^www\./, "");

     // YouTube
     let youtubeId = null;
     if (host === "youtu.be") {
          youtubeId = url.pathname.slice(1).split("/")[0];
     } else if (
          ["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(
               host,
          )
     ) {
          if (url.pathname === "/watch") {
               youtubeId = url.searchParams.get("v");
          } else {
               const match = url.pathname.match(
                    /^\/(embed|shorts|live)\/([\w-]{11})/,
               );
               if (match) youtubeId = match[2];
          }
     }
     if (youtubeId && /^[\w-]{11}$/.test(youtubeId)) {
          return {
               type: "iframe",
               src: `https://www.youtube-nocookie.com/embed/${youtubeId}?rel=0`,
          };
     }

     // Vimeo
     if (host === "vimeo.com") {
          const match = url.pathname.match(/^\/(\d+)/);
          if (match)
               return {
                    type: "iframe",
                    src: `https://player.vimeo.com/video/${match[1]}`,
               };
     }

     // A direct video file
     if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) {
          return { type: "video", src: url.href };
     }

     return { type: "link", src: url.href };
};
