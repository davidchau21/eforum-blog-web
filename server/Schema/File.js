import mongoose, { Schema } from "mongoose";

const fileSchema = mongoose.Schema({
        type: {
            type: String,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'users'
        },
        location: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true
    }
)

export default mongoose.model("file", fileSchema)