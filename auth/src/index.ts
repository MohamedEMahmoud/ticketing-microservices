import mongoose from 'mongoose';
import app from "./app";
(async () => {
    const Environment = ["JWT_KEY", "MONGO_URI"];
    Environment.forEach(el => {
        if (!process.env[el]) {
            throw new Error(`${el} Must Be Defined`);
        }
    });
    try {
        await mongoose.connect(process.env.MONGO_URI!, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        } as mongoose.ConnectOptions);
        mongoose.Promise = global.Promise;
        console.log("Connected to MongoDB Successfully From Auth service");
    } catch (err) {
        console.log(err);
    }
    app.listen(3000, () => console.log('listening on port 3000! From Auth service'));
})();
