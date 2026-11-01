import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { api, authHeader, setupDb, teardownDb, createUser } from "./helpers.js";
import mongoose from "mongoose";

describe("Authentication", () => {
     before(setupDb);
     after(teardownDb);

     const newUser = {
          name: "Ravi Kumar",
          email: "ravi@example.com",
          password: "password123",
     };
     let token;

     it("registers a student and never returns the password hash", async () => {
          const res = await api().post("/api/auth/register").send(newUser);
          assert.equal(res.status, 201);
          assert.equal(res.body.data.user.role, "student");
          assert.equal(res.body.data.user.passwordHash, undefined);
          assert.ok(res.body.data.token);
          token = res.body.data.token;
     });

     it("rejects a duplicate email", async () => {
          const res = await api().post("/api/auth/register").send(newUser);
          assert.equal(res.status, 409);
     });

     it("does not let anyone register as admin", async () => {
          const res = await api()
               .post("/api/auth/register")
               .send({
                    ...newUser,
                    email: "hacker@example.com",
                    role: "admin",
               });
          assert.equal(res.status, 400);
     });

     it("rejects invalid registration input", async () => {
          const res = await api()
               .post("/api/auth/register")
               .send({ name: "R", email: "not-an-email", password: "abc" });
          assert.equal(res.status, 400);
          assert.ok(res.body.errors.length >= 3);
     });

     it("logs in with correct credentials", async () => {
          const res = await api()
               .post("/api/auth/login")
               .send({ email: newUser.email, password: newUser.password });
          assert.equal(res.status, 200);
          assert.ok(res.body.data.token);
     });

     it("rejects a wrong password", async () => {
          const res = await api()
               .post("/api/auth/login")
               .send({ email: newUser.email, password: "wrongpass1" });
          assert.equal(res.status, 401);
          assert.equal(res.body.message, "Invalid email or password");
     });

     it("gives the same message for an unknown email", async () => {
          const res = await api()
               .post("/api/auth/login")
               .send({ email: "nobody@example.com", password: "password123" });
          assert.equal(res.status, 401);
          assert.equal(res.body.message, "Invalid email or password");
     });

     it("blocks /me without a token", async () => {
          const res = await api().get("/api/auth/me");
          assert.equal(res.status, 401);
     });

     it("blocks /me with a fake token", async () => {
          const res = await api().get("/api/auth/me").set(authHeader("abc123"));
          assert.equal(res.status, 401);
     });

     it("returns the current user for a valid token", async () => {
          const res = await api().get("/api/auth/me").set(authHeader(token));
          assert.equal(res.status, 200);
          assert.equal(res.body.data.user.email, newUser.email);
     });

     it("blocks login for a suspended account", async () => {
          const suspended = await createUser("student", { isActive: false });
          const res = await api()
               .post("/api/auth/login")
               .send({
                    email: suspended.user.email,
                    password: suspended.password,
               });
          assert.equal(res.status, 403);
     });

     it("stops an existing token the moment the account is suspended", async () => {
          const victim = await createUser("student");
          await mongoose
               .model("User")
               .updateOne({ _id: victim.user._id }, { isActive: false });
          const res = await api()
               .get("/api/auth/me")
               .set(authHeader(victim.token));
          assert.equal(res.status, 403);
     });

     it("rejects a wrong current password when changing password", async () => {
          const res = await api()
               .patch("/api/auth/change-password")
               .set(authHeader(token))
               .send({
                    currentPassword: "wrong12345",
                    newPassword: "newpass456",
               });
          assert.equal(res.status, 401);
     });

     it("changes the password", async () => {
          const res = await api()
               .patch("/api/auth/change-password")
               .set(authHeader(token))
               .send({
                    currentPassword: "password123",
                    newPassword: "newpass456",
               });
          assert.equal(res.status, 200);
     });

     it("accepts the new password and rejects the old one", async () => {
          const oldLogin = await api()
               .post("/api/auth/login")
               .send({ email: newUser.email, password: "password123" });
          const newLogin = await api()
               .post("/api/auth/login")
               .send({ email: newUser.email, password: "newpass456" });
          assert.equal(oldLogin.status, 401);
          assert.equal(newLogin.status, 200);
     });
});
