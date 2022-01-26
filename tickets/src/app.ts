import express from 'express';
import 'express-async-errors';
import morgan from 'morgan';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { NotFoundError, errorHandler, currentUser } from '@meticketing/common';
import { createTicketRouter } from './routes/new';
import { showTicketRouter } from './routes/show';
import { indexTicketRouter } from './routes/index';
import { updateTicketRouter } from "./routes/update";
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
    currentUser,
    createTicketRouter,
    showTicketRouter,
    indexTicketRouter,
    updateTicketRouter
]);

app.use('*', async () => { throw new NotFoundError(); }, errorHandler);

export default app;