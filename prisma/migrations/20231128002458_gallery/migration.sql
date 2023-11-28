/*
  Warnings:

  - You are about to drop the column `photo_author` on the `photos` table. All the data in the column will be lost.
  - You are about to drop the column `photo_domain` on the `photos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[photo_id,file_primary]` on the table `files` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `author_id` to the `photos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domain_id` to the `photos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `photo_rating` to the `photos` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "files_photo_id_key";

-- AlterTable
ALTER TABLE "photos" DROP COLUMN "photo_author",
DROP COLUMN "photo_domain",
ADD COLUMN     "author_id" INTEGER NOT NULL,
ADD COLUMN     "domain_id" INTEGER NOT NULL,
ADD COLUMN     "photo_rating" INTEGER NOT NULL,
ALTER COLUMN "added_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "modified_at" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "settings" ADD COLUMN     "ratingFav" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "ratings" TEXT[] DEFAULT ARRAY['General', 'Hidden']::TEXT[];

-- CreateTable
CREATE TABLE "author" (
    "author_id" SERIAL NOT NULL,
    "author_name" TEXT NOT NULL,

    CONSTRAINT "author_pkey" PRIMARY KEY ("author_id")
);

-- CreateTable
CREATE TABLE "domain" (
    "domain_id" SERIAL NOT NULL,
    "domain_name" TEXT NOT NULL,

    CONSTRAINT "domain_pkey" PRIMARY KEY ("domain_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "author_author_name_key" ON "author"("author_name");

-- CreateIndex
CREATE UNIQUE INDEX "domain_domain_name_key" ON "domain"("domain_name");

-- CreateIndex
CREATE UNIQUE INDEX "files_photo_id_file_primary_key" ON "files"("photo_id", "file_primary");

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "author"("author_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_domain_id_fkey" FOREIGN KEY ("domain_id") REFERENCES "domain"("domain_id") ON DELETE RESTRICT ON UPDATE CASCADE;
