import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from "supertest";

import app from '../app';

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = "TICKETING-PLATFORM-SECRET-KEY";

    mongo = await MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    } as mongoose.ConnectOptions);
    mongoose.Promise = global.Promise;
});

beforeEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

afterAll(async () => {
    await mongo.stop();
    await mongoose.connection.close();
});

declare global {
    function signup(): Promise<string[]>;
}

global.signup = async () => {
    const authResponse = await request(app)
        .post("/api/users/signup")
        .send({ email: "test@test.com", password: "password.test" })
        .expect(201);

    const cookie = authResponse.get("Set-Cookie");
    return cookie;
};
