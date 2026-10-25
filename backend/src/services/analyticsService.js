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

/**
 * Get system-wide platform analytics for administrators
 */
export async function getPlatformAdminAnalytics() {
  const [
    totalUsers,
    totalAttendees,
    totalOrganizers,
    totalAdmins,
    events,
    payments,
    refunds,
    totalWaitlist
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "ATTENDEE" } }),
    prisma.user.count({ where: { role: "ORGANIZER" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.event.findMany({
      include: {
        _count: {
          select: {
            registrations: true,
            waitlistEntries: true
          }
        },
        organizer: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.payment.findMany({
      where: { status: "SUCCEEDED" }
    }),
    prisma.refund.findMany({
      where: { status: "PROCESSED" }
    }),
    prisma.waitlistEntry.count({ where: { status: "WAITING" } })
  ]);

  let totalGrossPaise = 0;
  payments.forEach((p) => {
    totalGrossPaise += p.amount;
  });

  let totalRefundsPaise = 0;
  refunds.forEach((r) => {
    totalRefundsPaise += r.amount;
  });

  const totalRegistrations = events.reduce((sum, e) => sum + e._count.registrations, 0);
  const publishedEvents = events.filter((e) => e.status === "PUBLISHED").length;
  const draftEvents = events.filter((e) => e.status === "DRAFT").length;
  const cancelledEvents = events.filter((e) => e.status === "CANCELLED").length;

  return {
    overview: {
      totalUsers,
      totalAttendees,
      totalOrganizers,
      totalAdmins,
      totalEvents: events.length,
      publishedEvents,
      draftEvents,
      cancelledEvents,
      totalRegistrations,
      totalWaitlist,
      grossRevenue: totalGrossPaise / 100,
      totalRefunds: totalRefundsPaise / 100,
      netRevenue: (totalGrossPaise - totalRefundsPaise) / 100
    },
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      status: e.status,
      capacity: e.capacity,
      availableSeats: e.availableSeats,
      approvalRequired: e.approvalRequired,
      organizer: e.organizer,
      registrationsCount: e._count.registrations,
      waitlistCount: e._count.waitlistEntries,
      startTime: e.startTime,
      createdAt: e.createdAt
    }))
  };
}
