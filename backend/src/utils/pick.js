// pick({ a: 1, b: 2, c: 3 }, ["a", "c"]) -> { a: 1, c: 3 }
const pick = (source, allowedFields) => {
     const result = {};
     for (const field of allowedFields) {
          if (source?.[field] !== undefined) {
               result[field] = source[field];
          }
     }
     return result;
};

export default pick;
