import User from "../models/User";
import fetch from "node-fetch";
import bcrypt from "bcrypt";

export const getJoin = (req, res) => res.render("join", { pageTitle: "Join" });
// user에게 입력을 받으면 password와 password2가 같은지 확인하고, 만일 database에 username와 email이 있다면 에러를 보낸다.
// 만일 database에 동일한 usernmae과 email이 없다면 입력받은 데이터 토대로 create한다.
export const postJoin = async (req, res) => {
    const {name, username, email, password, password2, location} = req.body;
    const pageTitle = "Join";
    if(password !== password2){
        return res.status(400).render("join", {
            pageTitle,
            errorMessage: "Passwrod confirmation does not match",
        });
    }
                        // username 또는 email이 이미 사용중이냐.찾을 수 있다.
    const exists = await User.exists({ $or: [{ username }, { email }] });
    if (exists){
        return res.status(400).render("join", { 
            pageTitle, 
            errorMessage:"This username/email is already taken.",
    });
}
    try {
        await User.create({
            name, 
            username, 
            email, 
            password, 
            location,
        });
        return res.redirect("/login");
    }catch (err) {
        console.log(err);
        return res.status(400).render("join", { 
            pageTitle: "Uplaod Video", 
            errorMessage: err._message
        });
    }
};

export const getLogin = (req, res) => res.render("login", { pageTitle:"Login"});
export const postLogin = async(req, res) => {
    const {username, password} = req.body;
    const pageTitle = "Login";
    // 사용자가 입력한 username으로 그리고 socialOnly값이 false인지 체크한다.
    // 
    const user = await User.findOne({ username, socialOnly: false });
    if(!user) {
        return res.status(400).render("login", { 
            pageTitle, 
            errorMessage: "An account with this username does not exists."})
    }
    // 암호화한 DB.비번과 사용자가 입력한 암호화된 비번이 동일한지 체크한다.
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "Wrong password",
        });
    }
    // 동일하다면 session 생성한다. 쿠키 보낸다.
    req.session.loggedIn = true; // 로그인 레코드를 보관
    req.session.user = user; // user 정보를 session에 저장한다.
    return res.redirect("/");
};

// 사용자가 base.pug의 github링크를 클릭하면 github 사이트로 이동(res.redirect(finalUrl))한다.
export const startGithubLogin = (req, res) => {
    const baseUrl= "https://github.com/login/oauth/authorize";
    const config = {
        // client_id를 통해서 github가 어떤 어플에 로그인하는지 안다.
        client_id: process.env.GH_CLIENT,
        // allow_signup 가입 허용.
        allow_signup:true,
        // scope에서 read:user했기 때문에 access_token 받을 수 있음.
        scope:"read:user user:email",
    }
    // config들을 문자열 url로 변환한다.
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
}

// 사용자가 공유하는데에 승인하면 github가 /github/finish라는 url로 돌려보낸다.
export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id: process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        // user가 돌아오면 url에 ?code=XXXX가 덧붙여진 내용을 받는다. github가 user가 승인했음을 알려주는 코드이다.
        code: req.query.code,
    }
    // baseUrl과 몇몇 parameter들을 받고 문자열 URL로 변환한다.
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    // finalUrl로 POST 요청을 한다. 
    const tokenRequest = await (await fetch(finalUrl, {
        method:"POST",
        headers: {
            Accept: "application/json",
        },
    })).json(); //const json = await data.json();
    console.log(tokenRequest);
    // url에 담긴 code를 github가 확인하고 access_token을 보낸다.
    // access_token이 있으면.
    if("access_token" in tokenRequest){
        // json에 access_token이 있다.
        const { access_token } = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (
            // ${apiurl}/user을 통해서 user 프로필을 받기위해 요청할 수 있다.
            await fetch(`${apiUrl}/user`, {
                headers: {
                    // Authorization은 권한 부여이다.
                    Authorization: `token ${access_token}`
            },
        })
    ).json();
    // 가끔 user가 email을 안보내줄 때가 있다. 그래서 email API를 사용한다.
    // access_token 을 통해 email 가져온다.
    const emailData = await (
        await fetch(`${apiUrl}/user/emails`, {
            headers: {
                Authorization: `token ${access_token}`
        },
    })
    ).json();
    // access_token을 주고 github가 확인해서 email array를 받는다.
    // email이(emaill array) primary인지 cerified인지 체크하고 해당되는 데이터만 찾는다.   
    const emailObj = emailData.find(
        (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
        return res.redirect("/login");
    }
    // emailObj의 email과 똑같은 email을 User database에서 찾는다.
    let user = await User.findOne({ email: emailObj.email });
    // database에 해당 email이 없다면 github 전용 데이터를 생성한다.
    if (!user) {
        const user = await User.create({
            avatarUrl: userData.avatar_url,
            name:userData.name ? userData.name : userData.login,  // userData.login은 github와 관련있다.
            username:userData.login,
            email:emailObj.email,
            password:"",
            // socialOnly가 true이면 github의 계정이다.
            socialOnly: true,
            location:userData.location,
        })
    }
            // 있다면 session에 저장한다. 쿠키 생성한다.
            req.session.loggedIn = true;
            req.session.user = user;
            return res.redirect("/");    
    } else {
        return res.redirect("/login")
    }
};

export const logout = async (req, res) => {
    // session을 destory()한다.
    await req.session.destroy();
    return res.redirect("/");
};
export const getEdit = (req, res) => {
    return res.render("edit-profile", {pageTitle: "Edit Profile", user: req.session.user });
}
export const postEdit = async (req, res) => {
    const {
        session :{
            user: { _id, avatarUrl, email: sessionemail, username: sessionusername } 
        },
        body: { name, email, username, location },
        file,
    } = req; // const id = req.session.user.id;
    const searchPamers = []; // session id와 사용자 id가 다른 경우 에러 출력을 위한. // 해당 email과 username을 쓰고있는 회원이라면 중복되도 괜찮으나, 타 id 사용자는 중복되면 안되니까.
    if (email !== sessionemail) {
        searchParam.push( { email });
    }
    if (username !== sessionusername ) {
        searchParam.push( { username })
    }
    if (searchPamers.length > 0) {
        const foundUser = await User.findOne({ $or: searchParam });
        if(foundUser && foundUser._id.toString() !== _id) {
            return res.status(HTTP_BAD_REQUEST).render("edit-profile", {
                pageTitle: "Edit profile",
                errorMessage: "This username/email is already taken.",
            });
        }
    }
    const updateUser = await User.findByIdAndUpdate(
        _id, 
    {
        avatarUrl: file ? file.path : avatarUrl,  // file이 있다면 file.path 없으면 avatarurl
        name,       // 기본적으로 findByIdAndUpdate 업뎃 전 리턴. new:true설정시 업뎃된 데이터 리턴.
        email, 
        username, 
        location,
    }, { new:true }); // options으로 최근 데이터를 원한다는 뜻이다.
    req.session.user = updateUser;
    return res.redirect("/users/edit");
}

export const getChangePassword = (req, res) => {
    // github 사용자일 경우 home으로 이동.
    if(req.session.user.socialOnly === true) {
        return res.redirect("/");
    }
    return res.render("users/change-password", {pageTitle:"Change Passowrd"})
}
export const postChangePassword = async (req, res) => {
    const {
        session: {
            user: { _id },
        },
        body: { oldPassword, newPassword, newPasswordConfirmation },
    }= req;
    const user = await User.findById(_id);
     // 사용자가 입력한 기존 pw와 session pw 비교 // 암호화
    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) {
        return res.status(400).render("users/change-password", {
            pageTitle: "Change Password",
            errorMessage: "The current password is incorrect",
        });
    }
    if (oldPassword === newPassword) {
        return res.status(400).render('users/change-password', {
        pageTitle,
        errorMessage: 'The old password equals new password',
        });
    }
    // new pw와 new pw confirmation 비교.
    if(newPassword !== newPasswordConfirmation){
        return res.status(400).render("users/change-password", { pageTitle: "ChangePassword", errorMessage: "The password does not match the confirmation."})
    }
    await user.save();
    req.session.destroy();
    return res.redirect('/login'); // return res.redirect("/users/logout");
};

export const see = async (req, res) => {
    // 해당 페이지를 모두가 볼 수 있어야하니까 session id가 아닌 params id로 가져온다.
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
        return res.status(404).render("404", { pageTitle: "User not found."});
    }
    return res.render("users/profile", { pageTitle: user.name, user });
};

