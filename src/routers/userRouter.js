import express from "express";
import { see, logout, edit  } from '../controllers/userControllers';

const userRouter = express.Router();

userRouter.get(":id", see);
userRouter.get("/logout", logout);
userRouter.get("/:id/edit", edit);


export default userRouter;