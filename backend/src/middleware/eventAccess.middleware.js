import prisma from "../config/prisma.js";

export const canManageEvent = async (req, res, next) => {
    try {
        const { eventId } = req.params;

        const event = await prisma.event.findUnique({
            where: {
                id: eventId
            }
        });

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        // Admin can manage any event
        if (req.user.role === "ADMIN") {
            req.event = event;
            return next();
        }

        // Organizer can manage only their own event
        if (event.organizerId !== req.user.id) {
            return res.status(403).json({
                message: "You do not have access to this event"
            });
        }

        req.event = event;

        next();

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};