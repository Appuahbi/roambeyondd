const Notification = require("../models/Notification");
const { emitToUser } = require("../config/socket");

const notifyUser = async (userId, { type, title, message, data = {} }) => {
    const doc = await Notification.create({
        user: userId,
        type,
        title,
        message,
        data
    });

    emitToUser(userId.toString(), "notification:new", doc.toObject());
    return doc;
};

const notifyMultiple = async (userIds, { type, title, message, data = {} }) => {
    const docs = await Notification.insertMany(
        userIds.map((id) => ({ user: id, type, title, message, data })),
        { ordered: false }
    );

    for (const doc of docs) {
        emitToUser(doc.user.toString(), "notification:new", doc.toObject());
    }

    return docs;
};

module.exports = { notifyUser, notifyMultiple };
