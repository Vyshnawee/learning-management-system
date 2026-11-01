import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import {
     api,
     authHeader,
     setupDb,
     teardownDb,
     createUser,
     createPublishedCourse,
} from "./helpers.js";

describe("Enrollment, lesson access and progress", () => {
     let instructor, otherInstructor, student, student2;
     let course, lessons, enrollmentId;

     before(async () => {
          await setupDb();
          instructor = await createUser("instructor");
          otherInstructor = await createUser("instructor");
          student = await createUser("student");
          student2 = await createUser("student");
          ({ course, lessons } = await createPublishedCourse(instructor));
     });
     after(teardownDb);

     const progress = (token, body, id = enrollmentId) =>
          api()
               .patch(`/api/enrollments/${id}/progress`)
               .set(authHeader(token))
               .send(body);
     const lessonId = (i) => String(lessons[i]._id);

     it("enrolls a student", async () => {
          const res = await api()
               .post(`/api/courses/${course._id}/enroll`)
               .set(authHeader(student.token));
          assert.equal(res.status, 201);
          assert.equal(res.body.data.enrollment.progressPercentage, 0);
          enrollmentId = res.body.data.enrollment._id;
     });

     it("blocks duplicate enrollment", async () => {
          const res = await api()
               .post(`/api/courses/${course._id}/enroll`)
               .set(authHeader(student.token));
          assert.equal(res.status, 409);
     });

     it("does not let an instructor enroll", async () => {
          const res = await api()
               .post(`/api/courses/${course._id}/enroll`)
               .set(authHeader(otherInstructor.token));
          assert.equal(res.status, 403);
     });

     it("does not allow enrolling in a draft course", async () => {
          const { course: draft } = await createPublishedCourse(instructor, {
               status: "draft",
          });
          const res = await api()
               .post(`/api/courses/${draft._id}/enroll`)
               .set(authHeader(student.token));
          assert.equal(res.status, 404);
     });

     it("does not allow enrolling in a paid course", async () => {
          const { course: paid } = await createPublishedCourse(instructor, {
               price: 10,
          });
          const res = await api()
               .post(`/api/courses/${paid._id}/enroll`)
               .set(authHeader(student.token));
          assert.equal(res.status, 400);
     });

     it("lists the student's enrolled courses", async () => {
          const res = await api()
               .get("/api/enrollments/my-courses")
               .set(authHeader(student.token));
          assert.equal(res.status, 200);
          assert.equal(res.body.pagination.total, 1);
     });

     it("shows video links only for preview lessons to a non-enrolled student", async () => {
          const res = await api()
               .get(`/api/courses/${course._id}/sections`)
               .set(authHeader(student2.token));
          const list = res.body.data.sections[0].lessons;
          assert.ok(
               list[0].videoUrl,
               "preview lesson should have a video link",
          );
          assert.equal(list[1].videoUrl, undefined);
          assert.equal(list[2].videoUrl, undefined);
     });

     it("shows every video link to an enrolled student", async () => {
          const res = await api()
               .get(`/api/courses/${course._id}/sections`)
               .set(authHeader(student.token));
          const list = res.body.data.sections[0].lessons;
          assert.ok(list.every((lesson) => lesson.videoUrl));
     });

     it("blocks a non-enrolled student from a non-preview lesson but allows the preview", async () => {
          const blocked = await api()
               .get(`/api/lessons/${lessonId(1)}`)
               .set(authHeader(student2.token));
          const preview = await api().get(`/api/lessons/${lessonId(0)}`);
          assert.equal(blocked.status, 403);
          assert.equal(preview.status, 200);
     });

     it("lets an enrolled student open any lesson", async () => {
          const res = await api()
               .get(`/api/lessons/${lessonId(1)}`)
               .set(authHeader(student.token));
          assert.equal(res.status, 200);
     });

     it("calculates 33% after one lesson and remembers the last lesson", async () => {
          const res = await progress(student.token, { lessonId: lessonId(0) });
          assert.equal(res.status, 200);
          assert.equal(res.body.data.progressPercentage, 33);
          assert.equal(res.body.data.lastAccessedLessonId, lessonId(0));
     });

     it("does not double count the same lesson", async () => {
          const res = await progress(student.token, { lessonId: lessonId(0) });
          assert.equal(res.body.data.progressPercentage, 33);
          assert.equal(res.body.data.completedLessonIds.length, 1);
     });

     it("reaches 100% and completes the course when every lesson is done", async () => {
          const second = await progress(student.token, {
               lessonId: lessonId(1),
          });
          assert.equal(second.body.data.progressPercentage, 66);
          const third = await progress(student.token, {
               lessonId: lessonId(2),
          });
          assert.equal(third.body.data.progressPercentage, 100);
          assert.equal(third.body.data.isCompleted, true);
          assert.ok(third.body.data.completedAt);
     });

     it("goes back down when a lesson is marked not completed", async () => {
          const res = await progress(student.token, {
               lessonId: lessonId(2),
               completed: false,
          });
          assert.equal(res.body.data.progressPercentage, 66);
          assert.equal(res.body.data.completedAt, null);
     });

     it("ignores progress values sent by the client", async () => {
          const res = await progress(student.token, {
               lessonId: lessonId(0),
               progressPercentage: 100,
               completedAt: "2020-01-01",
          });
          assert.equal(res.body.data.progressPercentage, 66);
          assert.equal(res.body.data.completedAt, null);
     });

     it("rejects a lesson from a different course", async () => {
          const other = await createPublishedCourse(instructor);
          const res = await progress(student.token, {
               lessonId: String(other.lessons[0]._id),
          });
          assert.equal(res.status, 404);
     });

     it("does not let another student change this enrollment", async () => {
          const res = await progress(student2.token, { lessonId: lessonId(0) });
          assert.equal(res.status, 404);
     });

     it("does not let an instructor use the progress route", async () => {
          const res = await progress(instructor.token, {
               lessonId: lessonId(0),
          });
          assert.equal(res.status, 403);
     });

     it("lets the owner see the course enrollments but not another instructor", async () => {
          const owner = await api()
               .get(`/api/courses/${course._id}/enrollments`)
               .set(authHeader(instructor.token));
          const other = await api()
               .get(`/api/courses/${course._id}/enrollments`)
               .set(authHeader(otherInstructor.token));
          assert.equal(owner.status, 200);
          assert.equal(owner.body.pagination.total, 1);
          assert.equal(other.status, 403);
     });
});
