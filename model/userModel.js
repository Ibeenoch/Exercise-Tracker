import mongoose from "mongoose";

const userSchema = mongoose.Schema({
    username: {
        type: String,
        require: true,
    }
});

const Owner = mongoose.model('Owner', userSchema);

export default Owner;