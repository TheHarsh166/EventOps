import prisma from "../config/prisma.js";


export const createEventService = async ({
    data,
    organizerId
}) => {

    const {
        title,
        description,
        location,
        startTime,
        endTime,
        registrationDeadline,
        capacity,
        price = 0,
        approvalRequired = false,
        overbookingBuffer = 0
    } = data;


    if (!title || !startTime || !endTime || !capacity) {
        throw new Error("Required fields are missing");
    }


    if (!Number.isInteger(capacity) || capacity <= 0) {
        throw new Error(
            "Capacity must be a positive integer"
        );
    }


    if (
        !Number.isInteger(overbookingBuffer) ||
        overbookingBuffer < 0
    ) {
        throw new Error(
            "Invalid overbooking buffer"
        );
    }


    const start = new Date(startTime);
    const end = new Date(endTime);


    if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime())
    ) {
        throw new Error(
            "Invalid event dates"
        );
    }


    if (start >= end) {
        throw new Error(
            "Start time must be before end time"
        );
    }


    let deadline = null;


    if (registrationDeadline) {

        deadline = new Date(registrationDeadline);

        if (Number.isNaN(deadline.getTime())) {
            throw new Error(
                "Invalid registration deadline"
            );
        }

        if (deadline >= start) {
            throw new Error(
                "Registration deadline must be before event start"
            );
        }
    }


    return await prisma.event.create({
        data: {
            title: title.trim(),

            description: description?.trim() || "",

            location: location?.trim() || "",

            startTime: start,

            endTime: end,

            capacity,

            availableSeats: capacity,

            price: Number(price) >= 0 ? Number(price) : 0,

            approvalRequired: Boolean(
                approvalRequired
            ),

            overbookingBuffer,

            status: "DRAFT",

            organizerId
        }
    });
};


export const getPublishedEventsService = async () => {

    return await prisma.event.findMany({
        where: {
            status: "PUBLISHED"
        },

        orderBy: {
            startTime: "asc"
        }
    });
};

export const getMyEventsService = async (organizerId) => {
    return await prisma.event.findMany({
        where: {
            organizerId
        },
        include: {
            registrations: {
                select: {
                    id: true,
                    status: true
                }
            },
            waitlistEntries: {
                select: {
                    id: true,
                    status: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });
};

export const getAllEventsAdminService = async ({ status, search, page = 1, limit = 20 }) => {
    const where = {};
    if (status) {
        where.status = status;
    }
    if (search && search.trim().length > 0) {
        where.OR = [
            { title: { contains: search.trim(), mode: "insensitive" } },
            { location: { contains: search.trim(), mode: "insensitive" } }
        ];
    }

    const take = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (Math.max(1, Number(page) || 1) - 1) * take;

    const [events, total] = await Promise.all([
        prisma.event.findMany({
            where,
            include: {
                organizer: {
                    select: { id: true, name: true, email: true }
                },
                _count: {
                    select: {
                        registrations: true,
                        waitlistEntries: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take
        }),
        prisma.event.count({ where })
    ]);

    return {
        events,
        pagination: {
            total,
            page: Number(page) || 1,
            limit: take,
            pages: Math.ceil(total / take)
        }
    };
};


export const getEventByIdService = async (
    eventId,
    user = null
) => {
    const event = await prisma.event.findUnique({
        where: {
            id: eventId
        }
    });

    if (!event) {
        return null;
    }

    if (event.status === "PUBLISHED") {
        return event;
    }

    // If event is not published (e.g. DRAFT or CANCELLED), allow organizer or admin
    if (user && (user.role === "ADMIN" || event.organizerId === user.id || event.organizerId === user.userId)) {
        return event;
    }

    return null;
};

export const updateEventService = async ({
    eventId,
    data,
    user
}) => {

    const event = await prisma.event.findUnique({
        where: {
            id: eventId
        }
    });

    if (!event) {
        throw new Error("Event not found");
    }


    // Extra defensive authorization check.
    // Middleware already checks this,
    // but the service does not blindly trust callers.

    if (
        user.role !== "ADMIN" &&
        event.organizerId !== user.id
    ) {
        throw new Error(
            "You do not have access to this event"
        );
    }


    const updateData = {};


    if (data.title !== undefined) {

        if (
            typeof data.title !== "string" ||
            data.title.trim().length === 0
        ) {
            throw new Error(
                "Invalid title"
            );
        }

        updateData.title = data.title.trim();
    }


    if (data.description !== undefined) {

        updateData.description =
            data.description?.trim() || "";
    }


    if (data.location !== undefined) {

        updateData.location =
            data.location?.trim() || "";
    }


    if (data.startTime !== undefined) {

        const start = new Date(data.startTime);

        if (Number.isNaN(start.getTime())) {
            throw new Error(
                "Invalid start time"
            );
        }

        updateData.startTime = start;
    }


    if (data.endTime !== undefined) {

        const end = new Date(data.endTime);

        if (Number.isNaN(end.getTime())) {
            throw new Error(
                "Invalid end time"
            );
        }

        updateData.endTime = end;
    }


    if (
        updateData.startTime ||
        updateData.endTime
    ) {

        const finalStart =
            updateData.startTime || event.startTime;

        const finalEnd =
            updateData.endTime || event.endTime;

        if (finalStart >= finalEnd) {
            throw new Error(
                "Start time must be before end time"
            );
        }
    }


    if (data.price !== undefined) {
        const p = Number(data.price);
        if (Number.isNaN(p) || p < 0) {
            throw new Error("Price must be a valid non-negative number");
        }
        updateData.price = p;
    }

    if (data.approvalRequired !== undefined) {
        updateData.approvalRequired = Boolean(data.approvalRequired);
    }

    // Don't allow normal update to change these:
    //
    // organizerId
    // status
    // seatsLeft
    //
    // Those have dedicated business operations.


    if (Object.keys(updateData).length === 0) {
        throw new Error(
            "No valid fields to update"
        );
    }


    return await prisma.event.update({
        where: {
            id: eventId
        },

        data: updateData
    });
};

export const publishEventService = async (
    eventId
) => {

    const event = await prisma.event.findUnique({
        where: {
            id: eventId
        }
    });

    if (!event) {
        throw new Error(
            "Event not found"
        );
    }


    if (event.status !== "DRAFT") {
        throw new Error(
            "Only draft events can be published"
        );
    }


    return await prisma.event.update({
        where: {
            id: eventId
        },

        data: {
            status: "PUBLISHED"
        }
    });
};

export const cancelEventService = async (
    eventId
) => {

    const event = await prisma.event.findUnique({
        where: {
            id: eventId
        }
    });

    if (!event) {
        throw new Error(
            "Event not found"
        );
    }


    if (event.status === "CANCELLED") {
        throw new Error(
            "Event is already cancelled"
        );
    }


    if (event.status === "COMPLETED") {
        throw new Error(
            "Completed event cannot be cancelled"
        );
    }


    return await prisma.event.update({
        where: {
            id: eventId
        },

        data: {
            status: "CANCELLED"
        }
    });
};