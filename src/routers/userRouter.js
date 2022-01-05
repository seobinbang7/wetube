import express from "express";
import { see, getEdit, postEdit, startGithubLogin, finishGithubLogin, logout, getChangePassword, postChangePassword  } from '../controllers/userControllers';
import { protectorMiddleware, publicOnlyMiddleware, avatarUpload } from '../middlewares';

const userRouter = express.Router();

userRouter.get("/:id", see);
userRouter.get("/logout", protectorMiddleware, logout);
// multer은 avatar 파일을 받아서 upload 폴더에 저장하고 postEdit 실행한다.(서버 저장)
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(avatarUpload.single("avatar"), postEdit);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);


export default userRouter;