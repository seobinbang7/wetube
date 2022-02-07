import bcrypt from "bcrypt";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique:true, }, // required는 반드시 프로퍼티로 갖고있어야 하느냐? 여부를 묻는다.
    avatarUrl: String,
    githubId: { type: Number },
    username: { type: String, required: true, unique:true}, // unique는 유일한 값. email이 username이어선 안됀다. username도 마찬가지. 겹치면 안됨.
    password: { type: String },
    name: { type:String, required: true },
    location: String,
    videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
});

userSchema.pre('save', async function() {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 5);
    }
});

const User = mongoose.model("User", userSchema);
export default User;