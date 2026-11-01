import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { api, authHeader, setupDb, teardownDb, createUser } from "./helpers.js";

describe("Course management", () => {
     let instructor, otherInstructor, student, category;
     let courseId, slug, sectionId;

     before(async () => {
          await setupDb();
          instructor = await createUser("instructor");
          otherInstructor = await createUser("instructor");
          student = await createUser("student");
          category = await mongoose
               .model("Category")
               .create({ name: "Web Development" });
     });
     after(teardownDb);

     const courseBody = () => ({
          title: "Intro to React Testing",
          shortDescription: "Learn React basics",
          description: "A beginner friendly course.",
          categoryId: category._id.toString(),
          level: "beginner",
     });

     it("blocks a student from creating a course", async () => {
          const res = await api()
               .post("/api/courses")
               .set(authHeader(student.token))
               .send(courseBody());
          assert.equal(res.status, 403);
     });

     it("blocks a request without a token", async () => {
          const res = await api().post("/api/courses").send(courseBody());
          assert.equal(res.status, 401);
     });

     it("creates a draft owned by the instructor, ignoring a forged status", async () => {
          const res = await api()
               .post("/api/courses")
               .set(authHeader(instructor.token))
               .send({
                    ...courseBody(),
                    status: "published",
                    instructorId: otherInstructor.user._id,
               });
          assert.equal(res.status, 201);
          assert.equal(res.body.data.course.status, "draft");
          assert.equal(
               res.body.data.course.instructorId,
               String(instructor.user._id),
          );
          courseId = res.body.data.course._id;
          slug = res.body.data.course.slug;
     });

     it("rejects invalid course data", async () => {
          const res = await api()
               .post("/api/courses")
               .set(authHeader(instructor.token))
               .send({ title: "Hi" });
          assert.equal(res.status, 400);
     });

     it("rejects a category that does not exist", async () => {
          const res = await api()
               .post("/api/courses")
               .set(authHeader(instructor.token))
               .send({
                    ...courseBody(),
                    categoryId: new mongoose.Types.ObjectId().toString(),
               });
          assert.equal(res.status, 404);
     });

     it("hides drafts from the public list", async () => {
          const res = await api().get("/api/courses");
          assert.equal(res.status, 200);
          assert.equal(res.body.pagination.total, 0);
     });

     it("hides a draft from the public but shows it to the owner", async () => {
          const publicRes = await api().get(`/api/courses/${courseId}`);
          const ownerRes = await api()
               .get(`/api/courses/${courseId}`)
               .set(authHeader(instructor.token));
          assert.equal(publicRes.status, 404);
          assert.equal(ownerRes.status, 200);
     });

     it("will not publish a course with no lessons", async () => {
          const res = await api()
               .patch(`/api/courses/${courseId}/publish`)
               .set(authHeader(instructor.token));
          assert.equal(res.status, 400);
     });

     it("adds a section and a lesson", async () => {
          const sectionRes = await api()
               .post(`/api/courses/${courseId}/sections`)
               .set(authHeader(instructor.token))
               .send({ title: "Getting Started" });
          assert.equal(sectionRes.status, 201);
          assert.equal(sectionRes.body.data.section.order, 1);
          sectionId = sectionRes.body.data.section._id;

          const lessonRes = await api()
               .post(`/api/sections/${sectionId}/lessons`)
               .set(authHeader(instructor.token))
               .send({
                    title: "What is React?",
                    videoUrl: "https://example.com/v1",
                    duration: 10,
               });
          assert.equal(lessonRes.status, 201);
     });

     it("publishes a course that has a lesson", async () => {
          const res = await api()
               .patch(`/api/courses/${courseId}/publish`)
               .set(authHeader(instructor.token));
          assert.equal(res.status, 200);
          assert.equal(res.body.data.course.status, "published");
          assert.ok(res.body.data.course.publishedAt);
     });

     it("shows the published course in the public list and finds it by search", async () => {
          const list = await api().get("/api/courses");
          const search = await api().get("/api/courses?search=react");
          assert.equal(list.body.pagination.total, 1);
          assert.equal(search.body.data.courses.length, 1);
     });

     it("stops another instructor from editing the course", async () => {
          const res = await api()
               .patch(`/api/courses/${courseId}`)
               .set(authHeader(otherInstructor.token))
               .send({ title: "Stolen title" });
          assert.equal(res.status, 403);
     });

     it("stops another instructor from deleting the course", async () => {
          const res = await api()
               .delete(`/api/courses/${courseId}`)
               .set(authHeader(otherInstructor.token));
          assert.equal(res.status, 403);
     });

     it("lets the owner edit the course without changing its slug", async () => {
          const res = await api()
               .patch(`/api/courses/${courseId}`)
               .set(authHeader(instructor.token))
               .send({ title: "Intro to React Testing 2026" });
          assert.equal(res.status, 200);
          assert.equal(
               res.body.data.course.title,
               "Intro to React Testing 2026",
          );
          assert.equal(res.body.data.course.slug, slug);
     });

     it("rejects a malformed course ID", async () => {
          const res = await api().get("/api/courses/abc");
          assert.equal(res.status, 400);
     });

     it("returns 404 for an unknown course ID", async () => {
          const res = await api().get(
               `/api/courses/${new mongoose.Types.ObjectId()}`,
          );
          assert.equal(res.status, 404);
     });

     it("deletes the course together with its sections and lessons", async () => {
          const res = await api()
               .delete(`/api/courses/${courseId}`)
               .set(authHeader(instructor.token));
          assert.equal(res.status, 200);
          assert.equal(
               await mongoose.model("Section").countDocuments({ courseId }),
               0,
          );
          assert.equal(
               await mongoose.model("Lesson").countDocuments({ courseId }),
               0,
          );
     });
});
