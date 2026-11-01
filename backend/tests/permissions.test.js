import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { api, authHeader, setupDb, teardownDb, createUser } from "./helpers.js";

describe("Role permissions", () => {
     let admin, instructor, student;

     before(async () => {
          await setupDb();
          admin = await createUser("admin");
          instructor = await createUser("instructor");
          student = await createUser("student");
     });
     after(teardownDb);

     const adminGetRoutes = [
          "/api/admin/dashboard",
          "/api/admin/users",
          "/api/admin/courses",
          "/api/admin/enrollments",
          "/api/admin/categories",
     ];

     for (const path of adminGetRoutes) {
          it(`protects GET ${path}`, async () => {
               const noToken = await api().get(path);
               const asStudent = await api()
                    .get(path)
                    .set(authHeader(student.token));
               const asInstructor = await api()
                    .get(path)
                    .set(authHeader(instructor.token));
               const asAdmin = await api()
                    .get(path)
                    .set(authHeader(admin.token));
               assert.equal(noToken.status, 401);
               assert.equal(asStudent.status, 403);
               assert.equal(asInstructor.status, 403);
               assert.equal(asAdmin.status, 200);
          });
     }

     it("lets only an admin create categories", async () => {
          const asStudent = await api()
               .post("/api/admin/categories")
               .set(authHeader(student.token))
               .send({ name: "Sneaky" });
          const asAdmin = await api()
               .post("/api/admin/categories")
               .set(authHeader(admin.token))
               .send({ name: "Cyber Security" });
          assert.equal(asStudent.status, 403);
          assert.equal(asAdmin.status, 201);
          assert.equal(asAdmin.body.data.category.slug, "cyber-security");
     });

     it("keeps the instructor dashboard for instructors", async () => {
          const asStudent = await api()
               .get("/api/instructor/dashboard")
               .set(authHeader(student.token));
          const asInstructor = await api()
               .get("/api/instructor/dashboard")
               .set(authHeader(instructor.token));
          assert.equal(asStudent.status, 403);
          assert.equal(asInstructor.status, 200);
     });

     it("keeps reviews and quiz attempts for students", async () => {
          const id = new mongoose.Types.ObjectId().toString();
          const review = await api()
               .post(`/api/courses/${id}/reviews`)
               .set(authHeader(instructor.token))
               .send({ rating: 5 });
          const attempt = await api()
               .post(`/api/quizzes/${id}/attempts`)
               .set(authHeader(instructor.token))
               .send({ answers: [] });
          assert.equal(review.status, 403);
          assert.equal(attempt.status, 403);
     });

     it("lets an admin suspend a student, which blocks the student's token at once", async () => {
          const res = await api()
               .patch(`/api/admin/users/${student.user._id}/status`)
               .set(authHeader(admin.token))
               .send({ isActive: false });
          assert.equal(res.status, 200);

          const me = await api()
               .get("/api/auth/me")
               .set(authHeader(student.token));
          assert.equal(me.status, 403);
     });

     it("does not let an admin suspend themselves or another admin", async () => {
          const otherAdmin = await createUser("admin");
          const self = await api()
               .patch(`/api/admin/users/${admin.user._id}/status`)
               .set(authHeader(admin.token))
               .send({ isActive: false });
          const other = await api()
               .patch(`/api/admin/users/${otherAdmin.user._id}/status`)
               .set(authHeader(admin.token))
               .send({ isActive: false });
          assert.equal(self.status, 400);
          assert.equal(other.status, 403);
     });

     it("does not let a student suspend anyone", async () => {
          const res = await api()
               .patch(`/api/admin/users/${instructor.user._id}/status`)
               .set(authHeader(student.token))
               .send({ isActive: false });
          assert.equal(res.status, 403);
     });
});
