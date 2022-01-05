import { redirect, render } from 'express/lib/response';
import Video from "../models/Video";
import User from "../models/User";

const videos = [
    {
        title: "First Video",
        rating:5,
        comments:2,
        createdAt: "2 minutes ago",
        views:59,
        id:1,
    },
    {
        title: "Second Video",
        rating:5,
        comments:2,
        createdAt: "2 minutes ago",
        views:59,
        id:2,
    },
    {
        title: "Third Video",
        rating:5,
        comments:2,
        createdAt: "2 minutes ago",
        views:59,
        id:3,
    },
];

export const home = async (req, res) => {
    const videos = await Video.find({}).sort();
    return res.render("home", { pageTitle: "Home", videos});
};
export const watch = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    const owner = await User.findById(video.owner);
    if(video === null){   
        return res.render("404", {pageTitle: 'video not found.'});
    }
        return res.render("watch", { pageTitle: video.title, video, owner });
};
export const getEdit = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    //${video.title}`
    if (!video) {
        return res.status(404).render("404", {pageTitle: "video not found."});        
    }
        return res.render("edit", {pageTitle: `Editing: ${video.title}`, video});
};

export const postEdit = async (req, res) =>{
    const { id } = req.params;
    const {title, description, hashtags} = req.body;
    const video = await Video.exists({ _id: id });
    if (!video) {
        return res.render("404", { pageTitle: "Video not found."});
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
        await Video.create({
            title,
            description,
            fileUrl,
            comments: 0,
            owner: _id,
            hashtags: Video.formatHashtags(hashtags),
        });
        return res.redirect("/");
    } catch (err) {
        console.log(err);
        return res.status(400).render("upload", { pageTitle: "Uplaod Video", errorMessage: err._message});
    }
};

export const deleteVideo = async (req, res) =>{
    const { id } = req.params;
    console.log(id);
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
}

export const search = async (req, res) => {
    const { keyword } = req.query;
    let videos = []; // search 접속시 template에서는 empty array
    if (keyword) {
        // keyword가 있다면 videos=[]을 업데이트
        videos = await Video.find({
            title: {
                $regex: new RegExp(keyword, "i")
            },
        });
    }
    return res.render("search", { pageTitle: "Search", videos });
}