import express from "express";
import morgan from "morgan";
import MongoStore from "connect-mongo";
import session from "express-session";
import videoRouter from './routers/videoRouter';
import userRouter from './routers/userRouter';
import rootRouter from './routers/rootRouter';
import apiRouter from'./routers/apiRouter';
import { localsMiddleware } from './middlewares';

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended:true })); // req.body 객체 반환
app.use(
    session({
    secret: process.env.COOKIE_SECRET,
    resave: false, 
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL,  
    })
}));
//cookie:{maxAge:(3.6e+6)*24}, // (3.6e+6)*24 24시간 뒤 만료(자동 삭제) 
// request마다 기존에 있던 session에 아무런 변경사항이 없어도 session을 다시 저장한다.
// request가 들어오면 해당 request에서 새로 생성된 session에 아무런 작업이 이루어지지 않은 상황을 말한다.
        // 클라이언트의 서버 방문 횟수에 따라 등급을 달리 하고 싶을 때 쓸 수 있다.

// 로그인이 되어있는지 확인한다.
app.use(localsMiddleware);
app.use("/uploads", express.static("uploads")) // express.static()에는 노출시키고 싶은 폴더이름을 적는다.
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);
app.use("/api", apiRouter);

export default app;