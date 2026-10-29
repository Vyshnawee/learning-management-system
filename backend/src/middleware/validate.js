import { validationResult } from "express-validator";

const validate = (req, res, next) => {
     const result = validationResult(req);

     if (!result.isEmpty()) {
          const errors = result.array().map((e) => ({
               field: e.path,
               message: e.msg,
          }));
          return res.status(400).json({
               success: false,
               message: "Validation failed",
               errors,
          });
     }

     next();
};

export default validate;
