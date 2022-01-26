import express, { Request, Response } from "express";
import { requireAuth, NotFoundError, NotAuthorizedError } from "@meticketing/common";
import { param } from "express-validator";
import mongoose from 'mongoose';
import { Order } from "../models/order.model";
const router = express.Router();

router.get("/api/orders/:orderId", requireAuth, async (req: Request, res: Response) => {
    param(req.params.orderId).not().isEmpty().custom((input: string) => mongoose.Types.ObjectId.isValid(input)).withMessage("Order Id must be provided and valid");

    const order = await Order.findById(req.params.orderId).populate("ticket");
    
    if (!order) {
        throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError();
    }

    res.status(200).send({ status: 200, order, success: true });
});

export { router as showOrderRouter };