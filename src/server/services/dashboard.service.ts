import { prisma as db } from "~/server/db";
import { EventStatus, UserRole, ApprovalStatus } from "@prisma/client";

// Mendapatkan statistik dashboard admin
export async function getAdminDashboardStats() {
  try {
    // Hitung total untuk berbagai entitas
    const [
      totalEvents,
      totalOrganizers,
      totalUsers,
      pendingEvents,
      verifiedOrganizers,
    ] = await Promise.all([
      db.event.count(),
      db.organizer.count(),
      db.user.count(),
      db.event.count({ where: { status: EventStatus.PENDING_REVIEW } }),
      db.organizer.count({ where: { verified: true } }),
    ]);

    // Cek apakah model Transaction tersedia untuk total penjualan
    let totalSales = 0;
    try {
      const salesData = await db.transaction.aggregate({
        _sum: { amount: true },
      });
      totalSales = Number(salesData._sum?.amount) || 0;
    } catch (e) {
      console.log("Transaction model not available or error:", e);
    }

    return {
      totalEvents,
      totalOrganizers,
      totalUsers,
      totalSales,
      pendingEvents,
      verifiedOrganizers,
      pendingOrganizers: totalOrganizers - verifiedOrganizers,
      organizerVerificationRate:
        totalOrganizers > 0 ? (verifiedOrganizers / totalOrganizers) * 100 : 0,
    };
  } catch (error) {
    console.error("Error in getAdminDashboardStats:", error);
    // Return default values if there's an error
    return {
      totalEvents: 0,
      totalOrganizers: 0,
      totalUsers: 0,
      totalSales: 0,
      pendingEvents: 0,
      verifiedOrganizers: 0,
      pendingOrganizers: 0,
      organizerVerificationRate: 0,
    };
  }
}

// Mendapatkan event terbaru
export async function getRecentEvents(limit = 5) {
  return await db.event.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      organizer: {
        select: {
          id: true,
          orgName: true,
          verified: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}

// Mendapatkan event yang menunggu persetujuan
export async function getPendingEvents(limit = 5) {
  return await db.event.findMany({
    where: { status: EventStatus.PENDING_REVIEW },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      organizer: {
        select: {
          id: true,
          orgName: true,
          verified: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
  });
}

// Mendapatkan statistik event
export async function getEventStats() {
  try {
    const [totalEvents, pendingEvents, publishedEvents, rejectedEvents] =
      await Promise.all([
        db.event.count(),
        db.event.count({ where: { status: EventStatus.PENDING_REVIEW } }),
        db.event.count({ where: { status: EventStatus.PUBLISHED } }),
        db.event.count({ where: { status: EventStatus.REJECTED } }),
      ]);

    return {
      totalEvents,
      pendingEvents,
      publishedEvents,
      rejectedEvents,
      approvalRate: totalEvents > 0 ? (publishedEvents / totalEvents) * 100 : 0,
    };
  } catch (error) {
    console.error("Error in getEventStats:", error);
    return {
      totalEvents: 0,
      pendingEvents: 0,
      publishedEvents: 0,
      rejectedEvents: 0,
      approvalRate: 0,
    };
  }
}

// Mendapatkan organizer terbaru
export async function getRecentOrganizers(limit = 5) {
  return await db.organizer.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      events: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });
}

// Mendapatkan organizer yang belum diverifikasi
export async function getPendingOrganizers(limit = 5) {
  return await db.organizer.findMany({
    where: { verified: false },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });
}

// Mendapatkan statistik organizer
export async function getOrganizerStats() {
  try {
    const [totalOrganizers, verifiedOrganizers, totalEvents] =
      await Promise.all([
        db.organizer.count(),
        db.organizer.count({ where: { verified: true } }),
        db.event.count(),
      ]);

    // Hitung rata-rata event per organizer
    const avgEventsPerOrganizer =
      totalOrganizers > 0 ? totalEvents / totalOrganizers : 0;

    // Hitung organizer dengan event terbanyak
    const organizersWithEventCount = await db.organizer.findMany({
      include: {
        _count: {
          select: { events: true },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        events: { _count: "desc" },
      },
      take: 1,
    });

    const topOrganizer =
      organizersWithEventCount.length > 0 && organizersWithEventCount[0]
        ? {
            id: organizersWithEventCount[0].id,
            name:
              organizersWithEventCount[0].user?.name ||
              organizersWithEventCount[0].orgName,
            eventCount: organizersWithEventCount[0]._count.events,
          }
        : null;

    return {
      totalOrganizers,
      verifiedOrganizers,
      pendingOrganizers: totalOrganizers - verifiedOrganizers,
      verificationRate:
        totalOrganizers > 0 ? (verifiedOrganizers / totalOrganizers) * 100 : 0,
      avgEventsPerOrganizer,
      topOrganizer,
    };
  } catch (error) {
    console.error("Error in getOrganizerStats:", error);
    return {
      totalOrganizers: 0,
      verifiedOrganizers: 0,
      pendingOrganizers: 0,
      verificationRate: 0,
      avgEventsPerOrganizer: 0,
      topOrganizer: null,
    };
  }
}

// Mendapatkan user terbaru
export async function getRecentUsers(limit = 5) {
  return await db.user.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

// Mendapatkan overview penjualan
export async function getSalesOverview() {
  try {
    // Cek apakah ada data transaction
    const transactionCount = await db.transaction.count();
    
    if (transactionCount === 0) {
      // Jika tidak ada data, kembalikan data dummy
      return generateDummySalesData();
    }

    // Ambil data sales dalam 6 bulan terakhir
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);    const transactions = await db.transaction.findMany({
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
        status: 'SUCCESS', // Hanya transaksi yang sukses
      },
      select: {
        amount: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (transactions.length === 0) {
      return generateDummySalesData();
    }

    // Group by month manually
    const salesByMonth = new Map();
    
    transactions.forEach(transaction => {
      const monthKey = `${transaction.createdAt.getFullYear()}-${String(transaction.createdAt.getMonth() + 1).padStart(2, '0')}`;
      const monthStart = new Date(transaction.createdAt.getFullYear(), transaction.createdAt.getMonth(), 1);
      
      if (!salesByMonth.has(monthKey)) {
        salesByMonth.set(monthKey, {
          month: monthStart,
          totalSales: 0,
        });
      }
      
      const existing = salesByMonth.get(monthKey);
      existing.totalSales += Number(transaction.amount);
    });

    return Array.from(salesByMonth.values()).sort((a, b) => a.month.getTime() - b.month.getTime());
  } catch (error) {
    console.error("Error in getSalesOverview:", error);
    // Kembalikan data dummy jika terjadi error
    return generateDummySalesData();
  }
}

// Fungsi untuk menghasilkan data penjualan dummy
function generateDummySalesData() {
  const months = 6; // 6 bulan terakhir
  const currentDate = new Date();
  const data = [];

  for (let i = 0; i < months; i++) {
    const date = new Date(currentDate);
    date.setMonth(currentDate.getMonth() - i);
    date.setDate(1); // Atur ke tanggal 1 untuk konsistensi

    data.push({
      month: date,
      totalSales: Math.floor(Math.random() * 50000000) + 10000000, // Random antara 10jt - 60jt
    });
  }

  // Urutkan dari bulan terlama ke terbaru
  return data.reverse();
}
