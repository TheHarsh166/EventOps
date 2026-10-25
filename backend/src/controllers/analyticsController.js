import { getOrganizerAnalytics } from "../services/analyticsService.js";

export const getOrganizerAnalyticsController = async (req, res) => {
  try {
    const analytics = await getOrganizerAnalytics(req.user.id);
    return res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch organizer analytics"
    });
  }
};
