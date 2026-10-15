import prisma from "../config/prisma.js";

export async function promoteNextAttendee(tx, eventId) {
    const event = await tx.event.findUnique({
        where: { id: eventId }
    });

    if (!event || event.status !== "PUBLISHED") {
        return null;
    }

    if (event.availableSeats <= 0) {
        return null;
    }

    // Find the oldest valid waiting attendee whose registration is eligible
    const waitingEntries = await tx.waitlistEntry.findMany({
        where: {
            eventId,
            status: "WAITING"
        },
        orderBy: [
            { createdAt: "asc" },
            { id: "asc" }
        ],
        take: 10
    });

    if (waitingEntries.length === 0) {
        return null;
    }

    let validEntry = null;
    let validRegistration = null;

    for (const entry of waitingEntries) {
        const registration = await tx.registration.findUnique({
            where: {
                userId_eventId: {
                    userId: entry.userId,
                    eventId
                }
            }
        });

        if (registration && registration.status === "WAITLISTED") {
            validEntry = entry;
            validRegistration = registration;
            break;
        } else {
            // Clean up stale waitlist entry
            await tx.waitlistEntry.update({
                where: { id: entry.id },
                data: { status: "CANCELLED" }
            });
        }
    }

    if (!validEntry || !validRegistration) {
        return null;
    }

    // Atomically reserve a seat. Another request may have
    // consumed it since we read the event.
    const seatUpdate = await tx.event.updateMany({
        where: {
            id: eventId,
            availableSeats: { gt: 0 },
            status: "PUBLISHED"
        },
        data: {
            availableSeats: { decrement: 1 }
        }
    });

    if (seatUpdate.count !== 1) {
        return null;
    }

    // A promoted attendee must pay for a paid event.
    // A free event can be confirmed immediately.
    const nextStatus = event.approvalRequired
        ? "PENDING"
        : Number(event.price ?? 0) > 0
            ? "PAYMENT_PENDING"
            : "CONFIRMED";

    await tx.registration.update({
        where: { id: validRegistration.id },
        data: { status: nextStatus }
    });

    await tx.waitlistEntry.update({
        where: { id: validEntry.id },
        data: { status: "PROMOTED" }
    });

    return {
        userId: validEntry.userId,
        eventId,
        registrationId: validRegistration.id,
        status: nextStatus
    };
}

export async function joinWaitlist(userId, eventId) {
    return prisma.$transaction(async (tx) => {
        const event = await tx.event.findUnique({
            where: { id: eventId }
        });

        if (!event || event.status !== "PUBLISHED") {
            throw new Error("Event is not available for registration");
        }

        const existing = await tx.registration.findUnique({
            where: {
                userId_eventId: { userId, eventId }
            }
        });

        if (existing) {
            throw new Error(
                "You already have a registration for this event"
            );
        }

        if (event.availableSeats > 0) {
            throw new Error(
                "Seats are available. Register through the normal registration endpoint."
            );
        }

        const registration = await tx.registration.create({
            data: {
                userId,
                eventId,
                status: "WAITLISTED"
            }
        });

        const entry = await tx.waitlistEntry.create({
            data: {
                userId,
                eventId,
                status: "WAITING"
            }
        });

        return { registration, waitlistEntry: entry };
    });
}