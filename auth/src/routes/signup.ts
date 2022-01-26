import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { User } from '../models/user.model';
import { body } from 'express-validator';
import { BadRequestError, validateRequest } from '@meticketing/common';
const route = express.Router();

route.post('/api/users/signup',
    [
        body('email').isEmail().withMessage("Email must be Valid!"),
        body("password").trim().isLength({ min: 4, max: 20 }).withMessage("Password must be between 4 and 20 characters")
    ],
    validateRequest,
    async (req: Request, res: Response) => {

        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            throw new BadRequestError("Email already exists");
        }
        const user = await User.build({ ...req.body });
        const userJwt = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_KEY!);
        req.session = { jwt: userJwt };
        await user.save();
        res.status(201).send({ status: 201, user, success: true });

    });

export { route as signupRouter };