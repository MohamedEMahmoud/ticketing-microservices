import express, { Request, Response } from 'express';

import { currentUser } from '@meticketing/common';

const route = express.Router();

route.get('/api/users/currentuser', currentUser, async (req: Request, res: Response) => {
    res.status(req.currentUser ? 200 : 404).send({ currentUser: req.currentUser || null });

});

export { route as currentUserRouter };