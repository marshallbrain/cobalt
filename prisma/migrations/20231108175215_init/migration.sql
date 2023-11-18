-- CreateTable
CREATE TABLE "files" (
    "file_id" SERIAL NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_hash" TEXT NOT NULL,
    "file_primary" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "modified_at" TIMESTAMP(3) NOT NULL,
    "photo_id" INTEGER NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("file_id")
);

-- CreateTable
CREATE TABLE "photos" (
    "photo_id" SERIAL NOT NULL,
    "photo_width" INTEGER NOT NULL,
    "photo_height" INTEGER NOT NULL,
    "photo_type" TEXT NOT NULL,
    "photo_name" TEXT NOT NULL,
    "photo_author" TEXT NOT NULL,
    "photo_domain" TEXT NOT NULL,
    "photo_source" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL,
    "modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photos_pkey" PRIMARY KEY ("photo_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "files_file_name_key" ON "files"("file_name");

-- CreateIndex
CREATE UNIQUE INDEX "files_photo_id_key" ON "files"("photo_id");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "photos"("photo_id") ON DELETE RESTRICT ON UPDATE CASCADE;
