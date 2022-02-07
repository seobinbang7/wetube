import express from "express";
import { see, getEdit, postEdit, startGithubLogin, finishGithubLogin, logout, getChangePassword, postChangePassword  } from '../controllers/userControllers';
import { protectorMiddleware, publicOnlyMiddleware, avatarUpload } from '../middlewares';

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
// multer은 avatar 파일을 받아서 upload 폴더에 저장하고 postEdit 실행한다.(서버 저장)
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(avatarUpload.single("avatar"), postEdit);
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
userRouter.get("/:id", see); // 얘가 logout, edit인 줄 앎. 그래서 맨 아래에 둬야 함.
// 다른 것과 달리 id를 직접 받아와서 써서 그런듯. 일단 그런듯.
export default userRouter;