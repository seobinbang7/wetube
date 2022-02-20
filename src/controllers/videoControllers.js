import Video from "../models/Video";
import User from "../models/User";
export const home = async (req, res) => {
    // 모든 controllers에는 id가 붙는다. video의 id도 가져온다.
    // sort는 정렬이다. sort를 사용해서 video를 순서대로 home에 보낸다. 그러면 video는 순서대로 노출된다.

  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
};

export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner");
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  return res.render("watch", { pageTitle: video.title, video });
};

export const getEdit = async (req, res) => {
    const { id } = req.params;
    const { user: { _id }} = req.session;
    const video = await Video.findById(id);
    //${video.title}`
    if (!video) {
        return res.status(404).render("404", {pageTitle: "video not found."});        
    }
    // video.owner은 obj  _id는 string
    if (String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
        return res.render("edit", {pageTitle: `Editing: ${video.title}`, video});
};

export const postEdit = async (req, res) =>{
    const {
        user: { _id },
    } = req.session;
    const { id } = req.params;
    const {title, description, hashtags} = req.body;
    const video = await Video.findById(id); 
    // exists({ _id: id })
    if (!video) {
        return res.render("404", { pageTitle: "Video not found."});
    }
    // video.owner은 obj  _id는 string
    if (String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        hashtags: Video.formatHashtags(hashtags),
    })
    return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) =>{
    // 현재 로그인 중인 user의 id.
    const {
        user: { _id },
    }= req.session;
    const { path: fileUrl } = req.file;
    const { title, description, hashtags } = req.body;
    try {
        const newVideo = await Video.create({
            title,
            description,
            fileUrl,
            comments: 0,
            owner: _id,
            hashtags: Video.formatHashtags(hashtags),
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
        return res.redirect("/");
    } catch (err) {
        console.log(err);
        return res.status(400).render("upload", { pageTitle: "Uplaod Video", errorMessage: err._message});
    }
};

export const deleteVideo = async (req, res) =>{
    const { id } = req.params;
    const {
        user: { _id },
    } = req.session;
    const video = await Video.findById(id);
    const user = await User.findById(_id);
    if (!video) {
        return res.status(404).render("404", { pageTitle: "Video not found."});
    }
    if (String(video.owner) !== String(_id)) {
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndDelete(id);
    user.videos.splice(user.videos.indexOf(id), 1);
    return res.redirect("/");
}

export const search = async (req, res) => {
    const { keyword } = req.query;
    let videos = []; // search 접속시 template에서는 empty array
    if (keyword) {
        // keyword가 있다면 videos=[]을 업데이트
        videos = await Video.find({
            title: {
                $regex: new RegExp(keyword, "i"),
            },
        }).populate("owner");
    }
    return res.render("search", { pageTitle: "Search", videos });
}

export const registerView = async  (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if(!video){
        return res.status(404);
    }
    video.meta.views = video.meta.views + 1;
    await video.save();
    return res.status(200);
};