import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type files = {
    fileId: Generated<number>;
    fileName: string;
    filePath: string;
    fileHash: string;
    filePrimary: boolean;
    createdAt: Timestamp;
    modifiedAt: Timestamp;
    photoId: number;
};
export type photos = {
    photoId: Generated<number>;
    photoWidth: number;
    photoHeight: number;
    photoType: string;
    photoName: string;
    photoAuthor: string;
    photoDomain: string;
    photoSource: string;
    createdAt: Timestamp;
    addedAt: Timestamp;
    modifiedAt: Timestamp;
};
export type settings = {
    id: Generated<number>;
    theme: Generated<string>;
};
export type DB = {
    files: files;
    photos: photos;
    settings: settings;
};
