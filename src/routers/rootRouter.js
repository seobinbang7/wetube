import express from "express";
import {join, login} from "../controllers/userControllers";
import {home, search} from '../controllers/videoControllers';
import {getJoin, postJoin, getLogin, postLogin} from "../controllers/userControllers";
import { publicOnlyMiddleware } from '../middlewares';

const rootRouter = express.Router();

rootRouter.get("/", home);
rootRouter.route("/join").all(publicOnlyMiddleware).get(getJoin).post(postJoin);
rootRouter.route("/login").all(publicOnlyMiddleware).get(getLogin).post(postLogin);
rootRouter.get("/search", search);


export default rootRouter;