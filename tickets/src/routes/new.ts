import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest } from '@meticketing/common';
import { Ticket } from '../models/ticket.model';
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-publisher";
import { natsWrapper } from '../nats-wrapper';
const router = express.Router();

router.post(
    '/api/tickets',
    requireAuth,
    [
        body('title').not().isEmpty().withMessage('Title is required'),
        body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0 ")
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const ticket = await Ticket.build({ ...req.body, userId: req.currentUser!.id });
        await ticket.save();
        const { id, title, price, userId, version } = ticket;
        await new TicketCreatedPublisher(natsWrapper.client).publish({ id, title, price, userId, version });
        res.status(201).send({ status: 201, ticket, success: true });
    });

export { router as createTicketRouter }; 