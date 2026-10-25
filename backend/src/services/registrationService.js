/* import prisma from "../config/prisma.js";

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

*/

/*
import prisma from "../config/prisma.js";

// Create a registration and reserve a seat atomically.
export const createRegistration = async (userId, eventId) => {
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error("Event not found");
    }

    if (event.status !== "PUBLISHED") {
      throw new Error("Registration is not available for this event");
    }

    const existing = await tx.registration.findUnique({
      where: {
        userId_eventId: { userId, eventId }
      }
    });

    if (existing) {
      throw new Error("You are already registered for this event");
    }

    // Reserve a seat only if one is still available.
    const reservation = await tx.event.updateMany({
      where: {
        id: eventId,
        status: "PUBLISHED",
        availableSeats: { gt: 0 }
      },
      data: {
        availableSeats: { decrement: 1 }
      }
    });

    if (reservation.count === 0) {
      throw new Error("No seats available");
    }

    const status = event.approvalRequired
      ? "PENDING"
      : "CONFIRMED";

    return tx.registration.create({
      data: {
        userId,
        eventId,
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
  });
};

// Get registrations belonging to the logged-in attendee.
export const getMyRegistrations = async (userId) => {
  return prisma.registration.findMany({
    where: { userId },
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
    orderBy: { createdAt: "desc" }
  });
};

// Cancel a registration that has not been paid for.
// Paid registrations must go through the refund workflow.
export const cancelRegistration = async (registrationId, userId) => {
  return prisma.$transaction(async (tx) => {
    const registration = await tx.registration.findUnique({
      where: { id: registrationId },
      include: { payment: true }
    });

    if (!registration) {
      throw new Error("Registration not found");
    }

    if (registration.userId !== userId) {
      throw new Error("You are not allowed to cancel this registration");
    }

    if (registration.status === "CANCELLED") {
      throw new Error("Registration is already inactive");
    }

    if (
      registration.status === "REJECTED" ||
      registration.status === "WAITLISTED"
    ) {
      await tx.registration.update({
        where: { id: registrationId },
        data: { status: "CANCELLED" }
      });

      // If a waitlist entry exists, cancel it too.
      await tx.waitlistEntry.updateMany({
        where: {
          userId: registration.userId,
          eventId: registration.eventId,
          status: "WAITING"
        },
        data: { status: "CANCELLED" }
      });

      return { id: registrationId, status: "CANCELLED" };
    }

    const payment = registration.payment;

    if (
      payment &&
      ["PROCESSING"].includes(payment.status)
    ) {
      throw new Error(
        "Payment is processing. Please wait for the payment result before cancelling."
      );
    }

    if (payment && payment.status === "SUCCEEDED") {
      throw new Error(
        "This registration has been paid for. Use the refund workflow to cancel it."
      );
    }

    if (
      !["PENDING", "PAYMENT_PENDING", "CONFIRMED"].includes(
        registration.status
      )
    ) {
      throw new Error("This registration cannot be cancelled");
    }

    // Only release a seat if this registration reserved one.
    const released = await tx.registration.updateMany({
      where: {
        id: registrationId,
        userId,
        status: registration.status
      },
      data: { status: "CANCELLED" }
    });

    if (released.count === 0) {
      throw new Error(
        "Registration status changed. Refresh and try again."
      );
    }

    await tx.event.update({
      where: { id: registration.eventId },
      data: { availableSeats: { increment: 1 } }
    });

    return {
      id: registrationId,
      status: "CANCELLED",
      message:
        "Registration cancelled. Waitlist promotion will be handled by the waitlist service."
    };
  });
};

// List registrations for an event owned by the organizer.
export const getEventRegistrations = async (eventId, organizerId) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.organizerId !== organizerId) {
    throw new Error(
      "You are not allowed to view registrations for this event"
    );
  }

  return prisma.registration.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });
};

// Approve a pending registration.
export const approveRegistration = async (
  registrationId,
  organizerId
) => {
  return prisma.$transaction(async (tx) => {
    const registration = await tx.registration.findUnique({
      where: { id: registrationId },
      include: { event: true }
    });

    if (!registration) {
      throw new Error("Registration not found");
    }

    if (registration.event.organizerId !== organizerId) {
      throw new Error(
        "You are not allowed to approve this registration"
      );
    }

    if (registration.status !== "PENDING") {
      throw new Error("Only pending registrations can be approved");
    }

    return tx.registration.updateMany({
      where: {
        id: registrationId,
        status: "PENDING"
      },
      data: { status: "CONFIRMED" }
    });
  });
};

// Reject a pending registration and release its reserved seat.
export const rejectRegistration = async (
  registrationId,
  organizerId
) => {
  return prisma.$transaction(async (tx) => {
    const registration = await tx.registration.findUnique({
      where: { id: registrationId },
      include: { event: true, payment: true }
    });

    if (!registration) {
      throw new Error("Registration not found");
    }

    if (registration.event.organizerId !== organizerId) {
      throw new Error(
        "You are not allowed to reject this registration"
      );
    }

    if (registration.status !== "PENDING") {
      throw new Error("Only pending registrations can be rejected");
    }

    if (
      registration.payment &&
      ["PROCESSING", "SUCCEEDED"].includes(
        registration.payment.status
      )
    ) {
      throw new Error(
        "Cannot reject a registration while its payment is processing or has succeeded. Resolve the payment or refund first."
      );
    }

    const updated = await tx.registration.updateMany({
      where: {
        id: registrationId,
        status: "PENDING"
      },
      data: { status: "REJECTED" }
    });

    if (updated.count === 0) {
      throw new Error(
        "Registration status changed. Refresh and try again."
      );
    }

    await tx.event.update({
      where: { id: registration.eventId },
      data: { availableSeats: { increment: 1 } }
    });

    return tx.registration.findUnique({
      where: { id: registrationId }
    });
  });
};


*/



import prisma from "../config/prisma.js";
import { promoteNextAttendee } from "./waitlistService.js";
import { createNotification } from "./notificationService.js";

// Create a registration, or add the attendee to the waitlist if full.
export const createRegistration = async (userId, eventId) => {
  return prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error("Event not found");
    }

    if (event.status !== "PUBLISHED") {
      throw new Error("Registration is not available for this event");
    }

    const existing = await tx.registration.findUnique({
      where: {
        userId_eventId: { userId, eventId }
      }
    });

    if (existing) {
      throw new Error("You are already registered for this event");
    }

    // Attempt to reserve one seat.
    const reservation = await tx.event.updateMany({
      where: {
        id: eventId,
        status: "PUBLISHED",
        availableSeats: { gt: 0 }
      },
      data: {
        availableSeats: { decrement: 1 }
      }
    });

    // No seat available: create both waitlist records atomically.
    if (reservation.count === 0) {
      const registration = await tx.registration.create({
        data: {
          userId,
          eventId,
          status: "WAITLISTED"
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

      await tx.waitlistEntry.create({
        data: {
          userId,
          eventId,
          status: "WAITING"
        }
      });

      return registration;
    }

    // Seat reserved successfully.
    const status = event.approvalRequired
      ? "PENDING"
      : Number(event.price ?? 0) > 0
        ? "PAYMENT_PENDING"
        : "CONFIRMED";

    return tx.registration.create({
      data: {
        userId,
        eventId,
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
  });
};

// Get registrations belonging to the logged-in attendee.
export const getMyRegistrations = async (userId) => {
  return prisma.registration.findMany({
    where: { userId },
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
    orderBy: { createdAt: "desc" }
  });
};

// Cancel an unpaid registration and promote the next attendee if
// a reserved seat is released.
export const cancelRegistration = async (registrationId, userId) => {
  return prisma.$transaction(async (tx) => {
    const registration = await tx.registration.findUnique({
      where: { id: registrationId },
      include: { payment: true }
    });

    if (!registration) {
      throw new Error("Registration not found");
    }

    if (registration.userId !== userId) {
      throw new Error("You are not allowed to cancel this registration");
    }

    if (registration.status === "CANCELLED") {
      throw new Error("Registration is already inactive");
    }

    // These statuses do not hold a seat that should be released here.
    if (
      registration.status === "REJECTED" ||
      registration.status === "WAITLISTED"
    ) {
      await tx.registration.update({
        where: { id: registrationId },
        data: { status: "CANCELLED" }
      });

      await tx.waitlistEntry.updateMany({
        where: {
          userId,
          eventId: registration.eventId,
          status: "WAITING"
        },
        data: { status: "CANCELLED" }
      });

      return {
        id: registrationId,
        status: "CANCELLED"
      };
    }

    const payment = registration.payment;

    if (payment && payment.status === "PROCESSING") {
      throw new Error(
        "Payment is processing. Wait for the payment result before cancelling."
      );
    }

    if (payment && payment.status === "SUCCEEDED") {
      throw new Error(
        "This registration has been paid for. Use the paid cancellation and refund endpoint."
      );
    }

    if (
      !["PENDING", "PAYMENT_PENDING", "CONFIRMED"].includes(
        registration.status
      )
    ) {
      throw new Error("This registration cannot be cancelled");
    }

    // Change status only if it has not changed since we read it.
    const updated = await tx.registration.updateMany({
      where: {
        id: registrationId,
        userId,
        status: registration.status
      },
      data: { status: "CANCELLED" }
    });

    if (updated.count !== 1) {
      throw new Error(
        "Registration status changed. Refresh and try again."
      );
    }

    // Release the seat.
    await tx.event.update({
      where: { id: registration.eventId },
      data: { availableSeats: { increment: 1 } }
    });

    // AUTOMATIC PROMOTION: same transaction as seat release.
    const promoted = await promoteNextAttendee(
      tx,
      registration.eventId
    );

    return {
      id: registrationId,
      status: "CANCELLED",
      promotedAttendee: promoted
    };
  });
};

// List registrations for an event owned by the organizer.
export const getEventRegistrations = async (eventId, organizerId) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.organizerId !== organizerId) {
    throw new Error(
      "You are not allowed to view registrations for this event"
    );
  }

  return prisma.registration.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });
};

// Approve a pending registration.
export const approveRegistration = async (registrationId, organizerId) => {
  return prisma.$transaction(async (tx) => {
    const registration = await tx.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: true,
        user: true,
        payment: true
      }
    });

    if (!registration) {
      throw new Error("Registration not found");
    }

    if (registration.event.organizerId !== organizerId) {
      throw new Error(
        "You are not allowed to approve this registration"
      );
    }

    if (registration.status !== "PENDING") {
      throw new Error("Only pending registrations can be approved");
    }

    if (
      registration.payment &&
      ["PROCESSING", "SUCCEEDED"].includes(registration.payment.status)
    ) {
      throw new Error(
        "Resolve the existing payment before approving this registration"
      );
    }

    // Paid registrations must complete payment before becoming confirmed.
    const isPaidEvent = Number(registration.event?.price ?? 0) > 0;

    const nextStatus = isPaidEvent
      ? "PAYMENT_PENDING"
      : "CONFIRMED";

    const updated = await tx.registration.updateMany({
      where: {
        id: registrationId,
        status: "PENDING"
      },
      data: { status: nextStatus }
    });

    if (updated.count !== 1) {
      throw new Error(
        "Registration status changed. Refresh and try again."
      );
    }

    await createNotification(tx, {
      userId: registration.userId,
      title: "Registration approved",
      message: isPaidEvent
        ? `Your registration for "${registration.event.title}" was approved. Complete payment to confirm your place.`
        : `Your registration for "${registration.event.title}" was approved and confirmed.`,
      type: "REGISTRATION_APPROVED"
    });

    return tx.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: true,
        user: {
          select: { id: true, name: true, email: true }
        },
        payment: true
      }
    });
  });
};

// Reject a pending registration, release its reserved seat,
// and automatically promote the next eligible attendee.
export const rejectRegistration = async (registrationId, organizerId) => {
  return prisma.$transaction(async (tx) => {
    const registration = await tx.registration.findUnique({
      where: { id: registrationId },
      include: {
        event: true,
        user: true,
        payment: true
      }
    });

    if (!registration) {
      throw new Error("Registration not found");
    }

    if (registration.event.organizerId !== organizerId) {
      throw new Error(
        "You are not allowed to reject this registration"
      );
    }

    if (registration.status !== "PENDING") {
      throw new Error("Only pending registrations can be rejected");
    }

    if (
      registration.payment &&
      ["PROCESSING", "SUCCEEDED"].includes(registration.payment.status)
    ) {
      throw new Error(
        "Cannot reject a registration with a processing or successful payment. Resolve the payment or refund first."
      );
    }

    const updated = await tx.registration.updateMany({
      where: {
        id: registrationId,
        status: "PENDING"
      },
      data: { status: "REJECTED" }
    });

    if (updated.count !== 1) {
      throw new Error(
        "Registration status changed. Refresh and try again."
      );
    }

    // Release the reserved seat.
    await tx.event.update({
      where: { id: registration.eventId },
      data: { availableSeats: { increment: 1 } }
    });

    await createNotification(tx, {
      userId: registration.userId,
      title: "Registration not approved",
      message: `Your registration for "${registration.event.title}" was not approved.`,
      type: "REGISTRATION_REJECTED"
    });

    // If someone is waiting, promote the next attendee into the released seat.
    const promoted = await promoteNextAttendee(
      tx,
      registration.eventId
    );

    return {
      registration: await tx.registration.findUnique({
        where: { id: registrationId },
        include: {
          event: true,
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      promotedAttendee: promoted
    };
  });
};
