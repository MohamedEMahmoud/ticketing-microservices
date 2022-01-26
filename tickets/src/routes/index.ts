import express, { Request, Response } from 'express';
import { NotFoundError } from '@meticketing/common';

import { Ticket } from '../models/ticket.model';
const router = express.Router();

router.get("/api/tickets", async (req: Request, res: Response) => {
    const tickets = await Ticket.find({});
    if (!tickets) {
        throw new NotFoundError();
    }
    res.status(200).send({ status: 200, tickets, success: true });
});

export { router as indexTicketRouter };