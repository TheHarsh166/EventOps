import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "../services/notificationService.js";

export const getMyNotificationsController = async (req, res) => {
  try {
    const notifications = await getUserNotifications(req.user.id);
    return res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch notifications"
    });
  }
};

export const markAsReadController = async (req, res) => {
  try {
    const notification = await markNotificationAsRead(
      req.params.notificationId,
      req.user.id
    );
    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update notification"
    });
  }
};

export const markAllAsReadController = async (req, res) => {
  try {
    const result = await markAllNotificationsAsRead(req.user.id);
    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      count: result.count
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update notifications"
    });
  }
};
