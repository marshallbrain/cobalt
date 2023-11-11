-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'dark',

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);
