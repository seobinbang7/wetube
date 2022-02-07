import multer from "multer";

// local // server에 연결. + app.use
export const localsMiddleware = (req, res, next) => {
     // session loggedIn = true 인지 Boolean으로 판정하고 저장한다. 템플릿에 보내서 if문으로 logout / login, join  노출
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user || {}; // 로그인 되어있는지 확인.
    //console.log(res.locals);
    next();
}

// 로그인 한 사람만 edit-profile 페이지에 접근한다. // router 적용
export const protectorMiddleware = (req, res, next) => {
    if(req.session.loggedIn){
        return next();
    }else{
        return res.redirect("/login");
    }
}

// 로그인 안했었던 사람이 로그인을 했는데 계속 로그인 페이지에 머물지 않도록한다.  // router 적용
export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn){
        return next();
    } else {
        return res.redirect("/");
    }
}

// uploads 파일에 저장 // 사진 저장 / 경로 & 용량
// user profile edit 
export const avatarUpload = multer({ 
    dest: "uploads/avatars/", limits: {
    fileSize: 300000, // 최대 300000 byts = 2861MB
}});
 // 비디오 저장 / 경로 & 용량
 // video upload
export const videoUpload = multer({ 
    dest: "uploads/videos/", limits: {
    fileSize: 1000000, // 최대 1000000 bytes = 953674MB
    // 잠시 test 때문에 0하나 더 늘림.
}});