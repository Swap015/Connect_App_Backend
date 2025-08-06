import User from "../models/userModel.js";
import Post from "../models/postModel.js";


export const globalSearch = async (req, res) => {
    try {
        const { keyword } = req.query;

        const users = await User.find({
            name: { $regex: keyword, $options: "i" }
        }).select("name email profileImage");

        const posts = await Post.find({
            content: { $regex: keyword, $options: "i" }
        }).populate("postedBy", "name profileImage");

        res.status(200).json({ users, posts });
    } catch (err) {
        res.status(400).json({ msg: "Global search failed", error: err.message });
    }
};
