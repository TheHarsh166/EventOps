import prisma from "../config/prisma.js";

export const createRegistration = async (userId, eventId) => {
  return await prisma.$transaction(
    async (tx) => {

      // 1. Find the event
      const event = await tx.event.findUnique({
        where: {
          id: eventId
        }
      });

      if (!event) {
        throw new Error("Event not found");
      }

      // 2. Event must be published
      if (event.status !== "PUBLISHED") {
        throw new Error("Registration is not available for this event");
      }

      // 3. Check whether user already registered
      const existingRegistration =
        await tx.registration.findUnique({
          where: {
            userId_eventId: {
              userId,
              eventId
            }
          }
        });

      if (existingRegistration) {
        throw new Error("You are already registered for this event");
      }

      // 4. Atomically reserve a seat
      const updatedEvent = await tx.event.updateMany({
        where: {
          id: eventId,
          availableSeats: {
            gt: 0
          }
        },
        data: {
          availableSeats: {
            decrement: 1
          }
        }
      });

      if (updatedEvent.count === 0) {
        throw new Error("No seats available");
      }

      // 5. Decide registration status
      const status = event.approvalRequired
        ? "PENDING"
        : "CONFIRMED";

      // 6. Create registration
      const registration = await tx.registration.create({
        data: {
          eventId,
          userId,
          status
        },
        include: {
          event: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return registration;
    }
  );
};

export const getMyRegistrations = async (userId) => {

  return await prisma.registration.findMany({
    where: {
      userId
    },

    include: {
      event: {
        select: {
          id: true,
          title: true,
          startTime: true,
          endTime: true,
          location: true,
          status: true
        }
      }
    },

    orderBy: {
      createdAt: "desc"
    }
  });
};

export const cancelRegistration = async (
  registrationId,
  userId
) => {

  return await prisma.$transaction(async (tx) => {

    const registration =
      await tx.registration.findUnique({
        where: {
          id: registrationId
        }
      });

    if (!registration) {
      throw new Error("Registration not found");
    }

    // Resource-level authorization
    if (registration.userId !== userId) {
      throw new Error(
        "You are not allowed to cancel this registration"
      );
    }

    if (registration.status === "CANCELLED") {
      throw new Error(
        "Registration is already inactive"
      );
    }

    const updatedRegistration =
      await tx.registration.update({
        where: {
          id: registrationId
        },
        data: {
          status: "CANCELLED"
        }
      });

    await tx.event.update({
      where: {
        id: registration.eventId
      },
      data: {
        availableSeats: {
          increment: 1
        }
      }
    });

    return updatedRegistration;
  });
};

export const getEventRegistrations = async (
  eventId,
  organizerId
) => {

  const event = await prisma.event.findUnique({
    where: {
      id: eventId
    }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.organizerId !== organizerId) {
    throw new Error(
      "You are not allowed to view registrations for this event"
    );
  }

  return await prisma.registration.findMany({
    where: {
      eventId
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },

    orderBy: {
      createdAt: "asc"
    }
  });
};

export const approveRegistration = async (
  registrationId,
  organizerId
) => {

  return await prisma.$transaction(async (tx) => {

    const registration =
      await tx.registration.findUnique({
        where: {
          id: registrationId
        },
        include: {
          event: true
        }
      });

    if (!registration) {
      throw new Error("Registration not found");
    }

    if (
      registration.event.organizerId !== organizerId
    ) {
      throw new Error(
        "You are not allowed to approve this registration"
      );
    }

    if (registration.status !== "PENDING") {
      throw new Error(
        "Only pending registrations can be approved"
      );
    }

    return await tx.registration.update({
      where: {
        id: registrationId
      },
      data: {
        status: "CONFIRMED"
      }
    });
  });
};

export const rejectRegistration = async (
  registrationId,
  organizerId
) => {

  return await prisma.$transaction(async (tx) => {

    const registration =
      await tx.registration.findUnique({
        where: {
          id: registrationId
        },
        include: {
          event: true
        }
      });

    if (!registration) {
      throw new Error("Registration not found");
    }

    if (
      registration.event.organizerId !== organizerId
    ) {
      throw new Error(
        "You are not allowed to reject this registration"
      );
    }

    if (registration.status !== "PENDING") {
      throw new Error(
        "Only pending registrations can be rejected"
      );
    }

    const updated =
      await tx.registration.update({
        where: {
          id: registrationId
        },
        data: {
          status: "CANCELLED"
        }
      });

    // Release the reserved seat
    await tx.event.update({
      where: {
        id: registration.eventId
      },
      data: {
        availableSeats: {
          increment: 1
        }
      }
    });

    return updated;
  });
};