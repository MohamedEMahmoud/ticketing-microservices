import { requireAuth, NotFoundError, NotAuthorizedError } from "@meticketing/common";
import express, { Request, Response } from "express";
import { Order, OrderStatus } from "../models/order.model";
import { param } from "express-validator";
import mongoose from "mongoose";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrapper } from "../nats-wrapper";
const router = express.Router();

router.patch("/api/orders/:orderId", requireAuth, async (req: Request, res: Response) => {
    param(req.params.orderId).not().isEmpty().custom((input: string) => mongoose.Types.ObjectId.isValid(input)).withMessage("Order Id must be provided and valid");

    const order = await Order.findById(req.params.orderId);

    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
        id: order.id,
        version: order.version,
        ticket: {
            id: order.ticket.id
        }
    });
    res.status(200).send({ status: 200, order, success: true });


});

export { router as updateOrderRouter };