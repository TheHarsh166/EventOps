import prisma from "../config/prisma.js";

/**
 * Create a notification for a user (can run inside an existing prisma transaction or standalone).
 */
export async function createNotification(txOrPrisma, { userId, title, message, type = "GENERAL" }) {
  const client = txOrPrisma || prisma;
  return await client.notification.create({
    data: {
      userId,
      title,
      message,
      type
    }
  });
}

/**
 * Get all notifications for a user, ordered by newest first.
 */
export async function getUserNotifications(userId) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(notificationId, userId) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notification || notification.userId !== userId) {
    throw new Error("Notification not found");
  }

  return await prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date()
    }
  });
}

/**
 * Mark all notifications for a user as read.
 */
export async function markAllNotificationsAsRead(userId) {
  return await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false
    },
    data: {
      isRead: true,
      readAt: new Date()
    }
  });
}
