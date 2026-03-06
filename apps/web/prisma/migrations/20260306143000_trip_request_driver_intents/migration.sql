-- CreateEnum
CREATE TYPE "TripRequestInitiatedBy" AS ENUM ('RIDER', 'DRIVER');

-- AlterTable
ALTER TABLE "TripRequest"
ADD COLUMN "initiatedBy" "TripRequestInitiatedBy" NOT NULL DEFAULT 'RIDER',
ADD COLUMN "sourcePoolRequestId" TEXT;

-- CreateIndex
CREATE INDEX "TripRequest_sourcePoolRequestId_idx" ON "TripRequest"("sourcePoolRequestId");

-- AddForeignKey
ALTER TABLE "TripRequest" ADD CONSTRAINT "TripRequest_sourcePoolRequestId_fkey" FOREIGN KEY ("sourcePoolRequestId") REFERENCES "PoolRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
