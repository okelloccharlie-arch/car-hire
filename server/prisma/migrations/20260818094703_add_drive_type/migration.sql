-- CreateEnum
CREATE TYPE "DriveType" AS ENUM ('SELF_DRIVE', 'CHAUFFEUR');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "driveType" "DriveType" NOT NULL DEFAULT 'SELF_DRIVE';
