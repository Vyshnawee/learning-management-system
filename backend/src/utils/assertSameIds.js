import AppError from "./AppError.js";

// Checks that the submitted IDs are exactly the existing IDs: no duplicates, none missing, none extra
const assertSameIds = (submitted, existing, fieldName) => {
     const submittedIds = submitted.map((id) => String(id).toLowerCase());
     const submittedSet = new Set(submittedIds);

     if (submittedSet.size !== submittedIds.length) {
          throw new AppError(`${fieldName} contains duplicate IDs`, 400);
     }

     const existingSet = new Set(existing.map((id) => String(id)));
     const sameSize = submittedSet.size === existingSet.size;
     const allKnown = submittedIds.every((id) => existingSet.has(id));

     if (!sameSize || !allKnown) {
          throw new AppError(
               `${fieldName} must list every item exactly once`,
               400,
          );
     }
};

export default assertSameIds;
