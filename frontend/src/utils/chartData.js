// Your API only returns days that had enrollments. This adds the empty days (with 0),
// so the chart shows the last N days in a row. Dates are UTC, like the server.
export const fillDays = (rows, days) => {
     const counts = new Map(rows.map((row) => [row.date, row.count]));
     const now = new Date();
     const result = [];

     for (let i = days - 1; i >= 0; i--) {
          const date = new Date(
               Date.UTC(
                    now.getUTCFullYear(),
                    now.getUTCMonth(),
                    now.getUTCDate() - i,
               ),
          );
          const key = date.toISOString().slice(0, 10);
          result.push({
               date: key,
               day: date.getUTCDate(),
               count: counts.get(key) || 0,
          });
     }
     return result;
};
