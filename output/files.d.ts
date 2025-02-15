export declare function parseFileSize(value: string | number): number;
export interface FileFieldOptions {
    name?: string;
    isRequired?: boolean;
    maxSize?: string;
    minSize?: string;
    maxFiles?: number;
    minFiles?: number;
    mimeTypes?: RegExp[] | string[];
}
/**
 * Metadata for a single file field.
 */
export interface FileFieldMetadata {
    propertyKey: string;
    isArray: boolean;
    options: FileFieldOptions;
}
/**
 * @IsFile - a decorator for a single file field (Express.Multer.File).
 */
export declare function IsFile(options?: FileFieldOptions): PropertyDecorator;
/**
 * @IsFiles - a decorator for an array of files (Express.Multer.File[]).
 */
export declare function IsFiles(options?: FileFieldOptions): PropertyDecorator;
/**
 * @BodyMultipart - merges req.body and req.files into one object.
 */
export declare function BodyMultipart<T>(type?: {
    new (): T;
}): ParameterDecorator;
/**
 * @UseMulter(dtoClass) - processes file fields based on DTO metadata.
 */
export declare function UseMulter(dtoClass: Function): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
//# sourceMappingURL=files.d.ts.map