import express, { Request, Response } from 'express';
import { NotFoundError } from '@meticketing/common';
import { Ticket } from '../models/ticket.model';
const router = express.Router();

router.get("/api/tickets/:id", async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
        throw new NotFoundError();
    }
    res.status(200).send({ status: 200, ticket, success: true });
});

export { router as showTicketRouter };