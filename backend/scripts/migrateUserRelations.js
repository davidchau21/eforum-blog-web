import mongoose from "mongoose";
import "dotenv/config";
import { connectDatabase } from "../config/database.js";

import User from "../Schema/User.js";
import UserAuth from "../Schema/UserAuth.js";
import UserFollow from "../Schema/UserFollow.js";
import UserInterest from "../Schema/UserInterest.js";

const connectDb = async () => {
  await connectDatabase();
};

const migrateUserAuth = async (user) => {
  const authUpdate = {};

  if (user.otp) authUpdate.otp = user.otp;
  if (user.otp_expiry_time) authUpdate.otp_expiry_time = user.otp_expiry_time;
  if (user.passwordResetToken) {
    authUpdate.passwordResetToken = user.passwordResetToken;
  }
  if (user.passwordResetExpires) {
    authUpdate.passwordResetExpires = user.passwordResetExpires;
  }
  if (user.passwordChangedAt) {
    authUpdate.passwordChangedAt = user.passwordChangedAt;
  }

  if (Object.keys(authUpdate).length) {
    await UserAuth.findOneAndUpdate(
      { user: user._id },
      { $set: authUpdate },
      { upsert: true, new: true }
    );
  }
};

const migrateUserFollows = async (user) => {
  const followingIds = Array.isArray(user.following) ? user.following : [];

  if (!followingIds.length) {
    return;
  }

  const operations = followingIds
    .filter(Boolean)
    .map((targetId) => ({
      updateOne: {
        filter: {
          follower: user._id,
          following: targetId,
        },
        update: {
          $setOnInsert: {
            follower: user._id,
            following: targetId,
          },
        },
        upsert: true,
      },
    }));

  if (operations.length) {
    await UserFollow.bulkWrite(operations, { ordered: false });
  }
};

const migrateUserInterests = async (user) => {
  const interests = Array.isArray(user.interests) ? user.interests : [];

  if (!interests.length) {
    return;
  }

  const operations = [...new Set(interests.map((tag) => tag?.trim()?.toLowerCase()).filter(Boolean))].map(
    (tag) => ({
      updateOne: {
        filter: { user: user._id, tag },
        update: {
          $setOnInsert: {
            user: user._id,
            tag,
            score: 1,
            lastInteractedAt: user.updatedAt || user.joinedAt || new Date(),
          },
        },
        upsert: true,
      },
    })
  );

  if (operations.length) {
    await UserInterest.bulkWrite(operations, { ordered: false });
  }
};

const cleanupLegacyFields = async (user) => {
  await User.updateOne(
    { _id: user._id },
    {
      $unset: {
        following: 1,
        followers: 1,
        interests: 1,
        blogs: 1,
        otp: 1,
        otp_expiry_time: 1,
        passwordConfirm: 1,
        passwordChangedAt: 1,
        passwordResetToken: 1,
        passwordResetExpires: 1,
      },
    }
  );
};

const run = async () => {
  await connectDb();

  const users = await User.find().select(
    "+following +followers +interests +blogs +otp +otp_expiry_time +passwordResetToken +passwordResetExpires +passwordChangedAt"
  );

  for (const user of users) {
    await migrateUserAuth(user);
    await migrateUserFollows(user);
    await migrateUserInterests(user);
    await cleanupLegacyFields(user);
  }

  const followerCounts = await UserFollow.aggregate([
    { $group: { _id: "$following", total: { $sum: 1 } } },
  ]);
  const followingCounts = await UserFollow.aggregate([
    { $group: { _id: "$follower", total: { $sum: 1 } } },
  ]);

  await User.updateMany(
    {},
    {
      $set: {
        "account_info.total_followers": 0,
        "account_info.total_following": 0,
      },
    }
  );

  for (const item of followerCounts) {
    await User.updateOne(
      { _id: item._id },
      { $set: { "account_info.total_followers": item.total } }
    );
  }

  for (const item of followingCounts) {
    await User.updateOne(
      { _id: item._id },
      { $set: { "account_info.total_following": item.total } }
    );
  }

  console.log("User relation migration completed.");
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Migration failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});
