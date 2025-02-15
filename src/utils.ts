
import { Expose, plainToClass } from "class-transformer";

type EnumLike = Array<unknown> | Record<string, unknown>;
type Constructor<T> = new () => T;

export function toDTO<T>(DTOClass: Constructor<T>, data: any): T {
    return plainToClass(DTOClass, data, {
        excludeExtraneousValues: true,
    });
}

export function toSlug(str: string) {
    return str
        .trim()
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/[^a-zA-Z0-9_.]+/g, "_")
        .toUpperCase();
}

export function getEnumValues<T extends EnumLike>(enumType: T): Array<string> {
    return Array.from(
        new Set(
            Object.keys(enumType)
                .filter((key) => isNaN(Number(key))) // Оставляем только строковые ключи
                .map((key) => (enumType as any)[key]) // Получаем значения из enum
                .filter((value): value is string => typeof value === 'string') // Убираем нестроковые значения
        )
    );
}
