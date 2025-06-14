-- CreateEnum
CREATE TYPE "QRCodeStatus" AS ENUM ('PENDING', 'GENERATED', 'ACTIVE', 'USED', 'EXPIRED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "endTime" TEXT,
ADD COLUMN     "startTime" TEXT;

-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "qrCodeData" TEXT,
ADD COLUMN     "qrCodeGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "qrCodeImageUrl" TEXT,
ADD COLUMN     "qrCodeStatus" "QRCodeStatus" NOT NULL DEFAULT 'PENDING';
