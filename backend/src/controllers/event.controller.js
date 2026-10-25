import {
    createEventService,
    getPublishedEventsService,
    getEventByIdService,
    updateEventService,
    publishEventService,
    cancelEventService
} from "../services/event.service.js";


export const getEvents = async (req, res) => {
    try {

        const events = await getPublishedEventsService();

        return res.status(200).json({
            events
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


export const getEventById = async (req, res) => {
    try {

        const event = await getEventByIdService(
            req.params.eventId
        );

        if (!event) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        return res.status(200).json({
            event
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


export const createEvent = async (req, res) => {
    try {

        const event = await createEventService({
            data: req.body,
            organizerId: req.user.id
        });

        return res.status(201).json({
            message: "Event created successfully",
            event
        });

    } catch (error) {

        return res.status(400).json({
            message: error.message
        });
    }
};


export const updateEvent = async (req, res) => {
    try {

        const event = await updateEventService({
            eventId: req.params.eventId,
            data: req.body,
            user: req.user
        });

        return res.status(200).json({
            message: "Event updated successfully",
            event
        });

    } catch (error) {

        console.error(error);

        return res.status(400).json({
            message: error.message
        });
    }
};


export const publishEvent = async (req, res) => {
    try {

        const event = await publishEventService(
            req.params.eventId
        );

        return res.status(200).json({
            message: "Event published successfully",
            event
        });

    } catch (error) {

        return res.status(400).json({
            message: error.message
        });
    }
};


export const cancelEvent = async (req, res) => {
    try {

        const event = await cancelEventService(
            req.params.eventId
        );

        return res.status(200).json({
            message: "Event cancelled successfully",
            event
        });

    } catch (error) {

        return res.status(400).json({
            message: error.message
        });
    }
};