import mongoose, { Schema } from "mongoose";

const alertSchema = mongoose.Schema(
    {
        notification_for: [{
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'users'
        }],
        user: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'users'
        },
        message: {
            type: String,
            required: true
        },

    },
    {
        timestamps: true
    }
);

export default mongoose.model("alerts", alertSchema);
