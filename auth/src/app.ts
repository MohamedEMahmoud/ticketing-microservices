import express from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import { json } from 'body-parser';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signupRouter } from './routes/signup';
import { signoutRouter } from './routes/signout';
import { NotFoundError, errorHandler } from '@meticketing/common';
import cookieSession from 'cookie-session';

const app = express();
// traffic is being proximate to our application through ingress nginx
//  we tell express to trust this proxy  and handel any traffic come from that proxy
app.set("trust proxy", true);
app.use([
    json(),
    cookieSession({
        signed: false, // disable encryption to jwt because jwt is encrypted
        secure: process.env.NODE_ENV !== 'test'// requiring that you must be on https connection
    }),
    morgan('dev'),
    currentUserRouter,
    signinRouter,
    signupRouter,
    signoutRouter,
]);

app.use('*', async () => { throw new NotFoundError(); }, errorHandler);

export default app;