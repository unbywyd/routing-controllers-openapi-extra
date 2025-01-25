type EnumLike = Array<unknown> | Record<string, unknown>;
type Constructor<T> = new () => T;
export declare function toDTO<T>(DTOClass: Constructor<T>, data: any): T;
export declare function toSlug(str: string): string;
export declare function getEnumValues<T extends EnumLike>(enumType: T): Array<string>;
export {};
//# sourceMappingURL=utils.d.ts.map