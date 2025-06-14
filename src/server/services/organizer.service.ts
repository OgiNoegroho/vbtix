import { prisma } from "~/server/db";
import { Prisma } from "@prisma/client";

export const organizerService = {
  // Mencari semua organizer dengan filter
  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    verified?: boolean;
  }) {
    const { page = 1, limit = 10, search, verified } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.OrganizerWhereInput = {
      ...(verified !== undefined && { verified }),
      ...(search && {
        OR: [
          { orgName: { contains: search, mode: "insensitive" } },
          { legalName: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    const [organizers, total] = await Promise.all([
      prisma.organizer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
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
      }),
      prisma.organizer.count({ where }),
    ]);

    return { organizers, total };
  },

  // Mencari organizer berdasarkan ID
  async findById(id: string) {
    return await prisma.organizer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        bankAccount: true,
        verification: true,
      },
    });
  },

  // Mencari organizer berdasarkan ID user
  async findByUserId(userId: string) {
    try {
      return await prisma.organizer.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          verification: true,
          bankAccount: true,
        },
      });
    } catch (error: any) {
      console.error(`Error finding organizer by userId ${userId}:`, error);

      // Re-throw database connectivity errors with more context
      if (error.code === 'P1001' || error.code === 'P1017') {
        const dbError = new Error(`Database connection failed: ${error.message}`);
        dbError.name = 'DatabaseConnectionError';
        (dbError as any).code = error.code;
        throw dbError;
      }

      throw error;
    }
  },

  // Mencari organizer berdasarkan ID user dengan auto-create jika tidak ada
  async findOrCreateByUserId(userId: string) {
    // Coba cari organizer yang sudah ada
    let organizer = await this.findByUserId(userId);

    if (!organizer) {
      // Cek apakah user ada dan memiliki role ORGANIZER
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user && user.role === "ORGANIZER") {
        // Auto-create organizer record
        try {
          organizer = await this.createOrganizerForUser(
            userId,
            user.name || "Organizer",
          );
        } catch (error) {
          console.error("Failed to auto-create organizer record:", error);
          return null;
        }
      }
    }

    return organizer;
  },

  // Membuat organizer baru
  async createOrganizer(data: Prisma.OrganizerCreateInput) {
    return await prisma.organizer.create({
      data,
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
  },

  // Membuat organizer record untuk user yang sudah ada
  async createOrganizerForUser(userId: string, orgName: string) {
    // Cek apakah user ada dan memiliki role ORGANIZER
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role !== "ORGANIZER") {
      throw new Error("User is not an organizer");
    }

    // Cek apakah organizer record sudah ada
    const existingOrganizer = await this.findByUserId(userId);
    if (existingOrganizer) {
      throw new Error("Organizer record already exists for this user");
    }

    // Buat organizer record baru dengan include yang sama seperti findByUserId
    return await prisma.organizer.create({
      data: {
        user: { connect: { id: userId } },
        orgName: orgName || user.name || "Organizer",
        verified: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        verification: true,
        bankAccount: true,
      },
    });
  },

  // Memperbarui organizer
  async updateOrganizer(id: string, data: Prisma.OrganizerUpdateInput) {
    return await prisma.organizer.update({
      where: { id },
      data,
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
  },

  // Menghapus organizer
  async deleteOrganizer(id: string) {
    return await prisma.organizer.delete({
      where: { id },
    });
  },

  // Memverifikasi organizer
  async verifyOrganizer(id: string, verified: boolean) {
    return await prisma.organizer.update({
      where: { id },
      data: { verified },
    });
  },

  // Mengupdate informasi bank account
  async updateBankAccount(id: string, bankData: Prisma.BankAccountUpdateInput) {
    const organizer = await prisma.organizer.findUnique({
      where: { id },
      include: { bankAccount: true },
    });

    if (!organizer) {
      throw new Error("Organizer not found");
    }

    if (organizer.bankAccount) {
      return await prisma.bankAccount.update({
        where: { id: organizer.bankAccount.id },
        data: bankData,
      });
    } else {
      return await prisma.bankAccount.create({
        data: {
          ...bankData,
          organizer: { connect: { id } },
        } as Prisma.BankAccountCreateInput,
      });
    }
  },
};
