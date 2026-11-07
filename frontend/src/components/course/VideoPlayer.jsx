import { ExternalLink, VideoOff } from "lucide-react";
import { getVideoSource } from "../../utils/video.js";

const frame = "aspect-video w-full overflow-hidden rounded-xl bg-black";

export default function VideoPlayer({ url, title }) {
     const source = getVideoSource(url);

     if (source.type === "iframe") {
          return (
               <div className={frame}>
                    <iframe
                         src={source.src}
                         title={title}
                         className="h-full w-full"
                         loading="lazy"
                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
                         referrerPolicy="strict-origin-when-cross-origin"
                         allowFullScreen
                    />
               </div>
          );
     }

     if (source.type === "video") {
          return (
               <div className={frame}>
                    <video
                         src={source.src}
                         controls
                         preload="metadata"
                         className="h-full w-full"
                    >
                         Your browser can&apos;t play this video.
                    </video>
               </div>
          );
     }

     return (
          <div
               className={`${frame} flex flex-col items-center justify-center gap-4 border border-outline-variant bg-surface-low p-6 text-center`}
          >
               <VideoOff size={36} className="text-outline" />
               {source.type === "link" ? (
                    <>
                         <p className="max-w-sm text-on-surface-variant">
                              This video can&apos;t be shown on this page, but
                              you can watch it on its own page.
                         </p>
                         <a
                              href={source.src}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-5 font-semibold text-on-primary hover:bg-primary-container"
                         >
                              Open video
                              <ExternalLink size={16} />
                         </a>
                    </>
               ) : (
                    <p className="text-on-surface-variant">
                         The video for this lesson is not available.
                    </p>
               )}
          </div>
     );
}
