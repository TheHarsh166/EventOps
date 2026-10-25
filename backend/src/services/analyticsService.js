import prisma from "../config/prisma.js";

/**
 * Get comprehensive analytics for an organizer across all their events
 */
export async function getOrganizerAnalytics(organizerId) {
  // 1. Fetch all events belonging to organizer
  const events = await prisma.event.findMany({
    where: { organizerId },
    include: {
      registrations: {
        include: {
          payment: true
        }
      },
      waitlistEntries: true
    },
    orderBy: { createdAt: "desc" }
  });

  const totalEvents = events.length;
  let totalRegistrations = 0;
  let confirmedAttendees = 0;
  let pendingApprovals = 0;
  let waitlistCount = 0;
  let totalRevenuePaise = 0;
  let totalRefundsPaise = 0;

  const eventBreakdown = events.map((event) => {
    const eventRegs = event.registrations;
    const eventConfirmed = eventRegs.filter((r) => r.status === "CONFIRMED").length;
    const eventPending = eventRegs.filter((r) => r.status === "PENDING").length;
    const eventWaitlisted = eventRegs.filter((r) => r.status === "WAITLISTED").length;
    const eventCancelled = eventRegs.filter((r) => r.status === "CANCELLED").length;
    const eventRejected = eventRegs.filter((r) => r.status === "REJECTED").length;

    let eventRevenuePaise = 0;
    eventRegs.forEach((r) => {
      if (r.payment && r.payment.status === "SUCCEEDED") {
        eventRevenuePaise += r.payment.amount;
      }
    });

    totalRegistrations += eventRegs.length;
    confirmedAttendees += eventConfirmed;
    pendingApprovals += eventPending;
    waitlistCount += eventWaitlisted;
    totalRevenuePaise += eventRevenuePaise;

    return {
      id: event.id,
      title: event.title,
      status: event.status,
      startTime: event.startTime,
      capacity: event.capacity,
      availableSeats: event.availableSeats,
      totalRegistrations: eventRegs.length,
      confirmedCount: eventConfirmed,
      pendingCount: eventPending,
      waitlistCount: eventWaitlisted,
      cancelledCount: eventCancelled,
      revenue: eventRevenuePaise / 100
    };
  });

  // Fetch refunds
  const refunds = await prisma.refund.findMany({
    where: {
      payment: {
        registration: {
          event: {
            organizerId
          }
        }
      },
      status: "PROCESSED"
    }
  });

  refunds.forEach((rf) => {
    totalRefundsPaise += rf.amount;
  });

  const netRevenue = (totalRevenuePaise - totalRefundsPaise) / 100;

  return {
    overview: {
      totalEvents,
      totalRegistrations,
      confirmedAttendees,
      pendingApprovals,
      waitlistCount,
      grossRevenue: totalRevenuePaise / 100,
      totalRefunds: totalRefundsPaise / 100,
      netRevenue
    },
    eventBreakdown
  };
}
