import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type author = {
    author_id: Generated<number>;
    author_name: string;
};
export type domain = {
    domain_id: Generated<number>;
    domain_name: string;
};
export type files = {
    file_id: Generated<number>;
    file_name: string;
    file_path: string;
    file_hash: string;
    file_primary: boolean;
    created_at: Timestamp;
    modified_at: Timestamp;
    photo_id: number;
};
export type photos = {
    photo_id: Generated<number>;
    photo_width: number;
    photo_height: number;
    photo_type: string;
    photo_name: string;
    photo_rating: string;
    photo_source: string;
    created_at: Timestamp;
    added_at: Generated<Timestamp>;
    modified_at: Generated<Timestamp>;
    author_id: number;
    domain_id: number;
};
export type settings = {
    id: Generated<number>;
    theme: Generated<string>;
};
export type DB = {
    author: author;
    domain: domain;
    files: files;
    photos: photos;
    settings: settings;
};
