import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { NotFoundError, NotAuthorizedError, requireAuth, validateRequest, BadRequestError } from '@meticketing/common';
import { Ticket } from '../models/ticket.model';
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-publisher";
import { natsWrapper } from "../nats-wrapper";


const router = express.Router();

router.put('/api/tickets/:id',
    requireAuth,
    [
        body('title').not().isEmpty().withMessage('Title is required'),
        body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0 ")
    ],
    validateRequest,
    async (req: Request, res: Response) => {

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) {
            throw new NotFoundError();
        }

        if (ticket.orderId) {
            throw new BadRequestError("Cannot edit a reserved ticket");
        }
        
        if (ticket.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }
        ticket.set({
            title: req.body.title,
            price: req.body.price
        });
        await ticket.save();
        const { id, title, price, userId, version } = ticket;
        await new TicketUpdatedPublisher(natsWrapper.client).publish({
            id, title, price, userId, version
        });
        res.status(200).send({ status: 200, ticket, success: true });
    });

export { router as updateTicketRouter };