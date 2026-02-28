-- CreateTable
CREATE TABLE "AppNotice" (
    "id" TEXT NOT NULL DEFAULT 'app-notice',
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppNotice_pkey" PRIMARY KEY ("id")
);
