import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { requireAuth, validateRequest, NotFoundError, BadRequestError } from "@meticketing/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket.model";
import { Order, OrderStatus } from "../models/order.model";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrapper } from "../nats-wrapper";
const router = express.Router();

const EXPIRATION_WINDOW_SECOND = 15;
router.post("/api/orders",
    requireAuth,
    [
        body('ticketId').not().isEmpty().custom((input: string) => mongoose.Types.ObjectId.isValid(input)).withMessage("Ticket Id must be provided and valid")
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        // Find the ticket the user is trying to order in the database
        const ticket = await Ticket.findById(req.body.ticketId);

        if (!ticket) {
            throw new NotFoundError();
        }
        // Make sure that this ticket is not already reserved
        const isReserved = await ticket.isReserved();
        if (isReserved) {
            throw new BadRequestError("Ticket is already reserved");
        }

        // Calculate an expiration date for this order
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + 60 * EXPIRATION_WINDOW_SECOND);

        // Build the order and save it to the database
        const order = await Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket
        });
        await order.save();
        // Publish an event saying that an order was created
        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            expiresAt: order.expiresAt.toISOString(),
            status: order.status,
            userId: order.userId,
            version: order.version,
            ticket: {
                id: ticket.id,
                price: ticket.price
            }
        });


        res.status(201).send({ status: 201, order, success: true });
    });

export { router as newOrderRouter };