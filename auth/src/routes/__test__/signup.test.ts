import request from 'supertest';
import app from '../../app';

it("Returns 201 on Successful Signup", async () => {
    request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "password.test"
        })
        .expect(201);
});

it("Returns 400 with an Invalid Email", async () => {
    request(app)
        .post("/api/users/signup")
        .send({
            email: "test",
            password: "password.test"
        })
        .expect(400);
});

it("Returns 400 with an Invalid Password", async () => {
    request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "p"
        })
        .expect(400);
});

it("Returns 400 with missing Email and Password", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
        })
        .expect(400);

    await request(app)
        .post("/api/users/signup")
        .send({
            password: "password.test"
        })
        .expect(400);
});

it("Disallows Duplicate Emails", async () => {
    await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "password.test"
        })
        .expect(201);

    await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "password.test"
        })
        .expect(400);
});

it("sets a cookie after successful signup", async () => {
    const response = await request(app)
        .post("/api/users/signup")
        .send({
            email: "test@test.com",
            password: "password.test"
        })
        .expect(201);
    expect(response.get("Set-Cookie")).toBeDefined();
});