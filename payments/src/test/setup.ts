import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { Message } from "node-nats-streaming";


jest.mock("../nats-wrapper");
jest.mock("../stripe");

let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = "TICKETING-PLATFORM-SECRET-KEY";

    mongo = await MongoMemoryServer.create();
    const mongoUri = await mongo.getUri();
    mongoose.Promise = global.Promise;
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    } as mongoose.ConnectOptions);
});

beforeEach(async () => {
    jest.clearAllMocks();
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
    function signin(): { cookie: string; id: string; };
    function MongooseId(): string;
    function fakeMessage(): Message;
}
global.MongooseId = () => {
    return new mongoose.Types.ObjectId().toHexString();
};
global.signin = () => {
    // Build a JWT payload {id, email}
    const payload = {
        id: global.MongooseId(),
        email: 'test@test.com',
    };
    // Create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!);
    // Build session Object {jwt: MY_JWT}
    const session = { jwt: token };
    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);
    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString("base64");
    // return a string thats the cookie with the encoded data
    return { cookie: `session=${base64}`, id: payload.id };
};

// create a fake message object
global.fakeMessage = () => {
    // @ts-ignore
    const fakeMsg: Message = {
        ack: jest.fn(),
    };
    return fakeMsg;
};
