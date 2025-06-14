import { prisma } from "~/server/db";

async function testReservationFlow() {
  try {
    console.log("Testing reservation flow...");

    // Find the test event
    const event = await prisma.event.findFirst({
      where: {
        slug: "tech-conference-2024-test",
      },
      include: {
        ticketTypes: true,
      },
    });

    if (!event) {
      console.error("Test event not found");
      return;
    }

    console.log("Found event:", event.title);
    console.log("Ticket types:", event.ticketTypes.length);

    if (event.ticketTypes.length === 0) {
      console.error("No ticket types found");
      return;
    }

    const ticketType = event.ticketTypes[0];
    if (!ticketType) {
      console.error("No ticket type found");
      return;
    }
    console.log(
      "Using ticket type:",
      ticketType.name,
      "Price:",
      ticketType.price,
    );

    // Test reservation creation
    const sessionId = `test_session_${Date.now()}`;
    console.log("Creating reservation with session ID:", sessionId);

    const reservation = await prisma.ticketReservation.create({
      data: {
        sessionId,
        ticketTypeId: ticketType.id,
        quantity: 1,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        status: "ACTIVE",
        metadata: {
          eventId: event.id,
          eventTitle: event.title,
          ticketTypeName: ticketType.name,
          ticketTypePrice: ticketType.price.toString(),
        },
      },
      include: {
        ticketType: {
          include: {
            event: true,
          },
        },
      },
    });

    console.log("Created reservation:", {
      id: reservation.id,
      sessionId: reservation.sessionId,
      quantity: reservation.quantity,
      expiresAt: reservation.expiresAt,
      status: reservation.status,
    });

    // Test reservation lookup
    const foundReservation = await prisma.ticketReservation.findUnique({
      where: { id: reservation.id },
      include: {
        ticketType: {
          include: {
            event: true,
          },
        },
      },
    });

    console.log("Found reservation:", foundReservation ? "YES" : "NO");

    // Test session lookup
    const sessionReservations = await prisma.ticketReservation.findMany({
      where: {
        sessionId,
        status: "ACTIVE",
        expiresAt: { gt: new Date() },
      },
      include: {
        ticketType: {
          include: {
            event: true,
          },
        },
      },
    });

    console.log("Session reservations found:", sessionReservations.length);

    // Cleanup
    await prisma.ticketReservation.delete({
      where: { id: reservation.id },
    });

    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testReservationFlow();
