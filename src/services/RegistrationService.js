import crypto from "crypto";
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
            eventId_userId: {
              eventId,
              userId
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
          seatsLeft: {
            gt: 0
          }
        },
        data: {
          seatsLeft: {
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

      // 6. Generate ticket code
      const ticketCode = crypto.randomUUID();

      // 7. Create registration
      const registration = await tx.registration.create({
        data: {
          eventId,
          userId,
          status,
          ticketCode
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