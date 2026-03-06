-- AlterTable
ALTER TABLE "PoolRequest" ADD COLUMN "tripType" "TripType" NOT NULL DEFAULT 'ONE_TIME';

-- CreateTable
CREATE TABLE "PoolRequestRepeatDay" (
    "id" TEXT NOT NULL,
    "poolRequestId" TEXT NOT NULL,
    "day" "Weekday" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PoolRequestRepeatDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PoolRequestRepeatDay_poolRequestId_day_key" ON "PoolRequestRepeatDay"("poolRequestId", "day");

-- CreateIndex
CREATE INDEX "PoolRequestRepeatDay_day_idx" ON "PoolRequestRepeatDay"("day");

-- AddForeignKey
ALTER TABLE "PoolRequestRepeatDay" ADD CONSTRAINT "PoolRequestRepeatDay_poolRequestId_fkey" FOREIGN KEY ("poolRequestId") REFERENCES "PoolRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
