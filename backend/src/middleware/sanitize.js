// Removes keys that MongoDB would treat as operators ("$gt", "$set") or paths ("a.b")
const clean = (value) => {
     if (Array.isArray(value)) {
          value.forEach(clean);
     } else if (value && typeof value === "object") {
          for (const key of Object.keys(value)) {
               if (key.startsWith("$") || key.includes(".")) {
                    delete value[key];
               } else {
                    clean(value[key]);
               }
          }
     }
};

const sanitizeBody = (req, res, next) => {
     clean(req.body);
     next();
};

export default sanitizeBody;
