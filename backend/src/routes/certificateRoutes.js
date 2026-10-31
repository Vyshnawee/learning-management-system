import express from "express";
import {
     issueCertificate,
     getMyCertificates,
     getCertificate,
} from "../controllers/certificateController.js";
import { idParam } from "../validators/commonValidators.js";
import { param } from "express-validator";
import validate from "../middleware/validate.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
     "/courses/:courseId/certificate",
     protect,
     authorize("student"),
     idParam("courseId"),
     validate,
     issueCertificate,
);

// "my-certificates" must be above "/:certificateId"
router.get(
     "/certificates/my-certificates",
     protect,
     authorize("student"),
     getMyCertificates,
);

router.get(
     "/certificates/:certificateId",
     param("certificateId")
          .matches(/^CERT-[A-F0-9]{12}$/)
          .withMessage("Invalid certificate ID format"),
     validate,
     getCertificate,
);

export default router;
