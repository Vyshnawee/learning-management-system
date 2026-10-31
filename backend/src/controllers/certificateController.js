import crypto from "crypto";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Quiz from "../models/Quiz.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Certificate from "../models/Certificate.js";
import AppError from "../utils/AppError.js";
import { recalculateProgress } from "../services/progressService.js";

const generateCertificateId = () =>
     `CERT-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

// POST /api/courses/:courseId/certificate  (student)
export const issueCertificate = async (req, res) => {
     const course = await Course.findById(req.params.courseId);
     if (!course) {
          throw new AppError("Course not found", 404);
     }

     const enrollment = await Enrollment.findOne({
          studentId: req.user._id,
          courseId: course._id,
     });
     if (!enrollment) {
          throw new AppError("You are not enrolled in this course", 403);
     }

     // Already issued: return the same certificate
     const existing = await Certificate.findOne({
          studentId: req.user._id,
          courseId: course._id,
     });
     if (existing) {
          return res.status(200).json({
               success: true,
               message: "Certificate already issued",
               data: { certificate: existing },
          });
     }

     // 1. Verify lesson completion on the server (recalculated, not trusted)
     const progress = await recalculateProgress(enrollment._id);
     if (!progress.completedAt) {
          throw new AppError(
               "Complete all lessons of this course to earn a certificate",
               400,
          );
     }

     // 2. Verify that every quiz of the course has been passed
     const quizzes = await Quiz.find({ courseId: course._id }).select("title");
     if (quizzes.length > 0) {
          const passedQuizIds = await QuizAttempt.distinct("quizId", {
               studentId: req.user._id,
               courseId: course._id,
               passed: true,
          });
          const notPassed = quizzes.filter(
               (quiz) => !passedQuizIds.some((id) => id.equals(quiz._id)),
          );
          if (notPassed.length > 0) {
               throw new AppError(
                    `Pass these quizzes first: ${notPassed.map((q) => q.title).join(", ")}`,
                    400,
               );
          }
     }

     try {
          const certificate = await Certificate.create({
               studentId: req.user._id,
               courseId: course._id,
               certificateId: generateCertificateId(),
          });

          res.status(201).json({
               success: true,
               message: "Certificate issued",
               data: { certificate },
          });
     } catch (error) {
          // Two requests at the same moment: the unique index stops the second one
          if (error.code === 11000) {
               const certificate = await Certificate.findOne({
                    studentId: req.user._id,
                    courseId: course._id,
               });
               if (certificate) {
                    return res.status(200).json({
                         success: true,
                         message: "Certificate already issued",
                         data: { certificate },
                    });
               }
          }
          throw error;
     }
};

// GET /api/certificates/my-certificates  (student)
export const getMyCertificates = async (req, res) => {
     const certificates = await Certificate.find({ studentId: req.user._id })
          .populate({
               path: "courseId",
               select: "title slug thumbnail instructorId",
               populate: { path: "instructorId", select: "name" },
          })
          .sort({ issuedAt: -1 });

     res.status(200).json({
          success: true,
          data: { certificates },
     });
};

// GET /api/certificates/:certificateId  (public, so anyone can verify a certificate)
export const getCertificate = async (req, res) => {
     const certificate = await Certificate.findOne({
          certificateId: req.params.certificateId,
     })
          .populate({ path: "studentId", select: "name" })
          .populate({
               path: "courseId",
               select: "title instructorId",
               populate: { path: "instructorId", select: "name" },
          });

     if (!certificate) {
          throw new AppError("Certificate not found", 404);
     }

     // Only non-sensitive details: no email, no IDs of users
     res.status(200).json({
          success: true,
          data: {
               certificate: {
                    certificateId: certificate.certificateId,
                    studentName: certificate.studentId?.name,
                    courseTitle: certificate.courseId?.title,
                    instructorName: certificate.courseId?.instructorId?.name,
                    issuedAt: certificate.issuedAt,
               },
          },
     });
};
