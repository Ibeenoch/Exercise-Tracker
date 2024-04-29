import mongoose from "mongoose";
import Owner from "./userModel.js";

const exerciseSchema = mongoose.Schema({
    description: {
        type: String,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Owner" 
    },
});

const ExerciseTrack = mongoose.model('ExerciseTrack', exerciseSchema);

export default ExerciseTrack; 