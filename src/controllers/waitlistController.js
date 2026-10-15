import { joinWaitlist } from "../services/waitlistService.js";

export async function joinWaitlistController(req, res) {
    try {
        const result = await joinWaitlist(
            req.user.id,
            req.params.eventId
        );

        return res.status(201).json({
            success: true,
            message: "Added to the event waitlist",
            ...result
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
}