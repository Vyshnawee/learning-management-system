const STYLES = {
     published: "bg-primary/15 text-primary",
     draft: "bg-surface-highest text-on-surface-variant",
     archived: "bg-secondary/20 text-secondary",
};

const LABELS = { published: "Published", draft: "Draft", archived: "Archived" };

export default function CourseStatusBadge({ status }) {
     return (
          <span
               className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold ${
                    STYLES[status] || STYLES.draft
               }`}
          >
               {LABELS[status] || status}
          </span>
     );
}
