import { Link } from "react-router-dom";

export default function NotFoundPage() {
     return (
          <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
               <p className="font-heading text-8xl font-bold text-primary">
                    404
               </p>
               <h1 className="mt-4 text-3xl font-semibold">Page not found</h1>
               <p className="mt-2 max-w-md text-on-surface-variant">
                    The page you are looking for doesn&apos;t exist or has been
                    moved.
               </p>
               <Link
                    to="/"
                    className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 font-semibold text-on-primary hover:bg-primary-container"
               >
                    Go to home
               </Link>
          </div>
     );
}
