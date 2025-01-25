"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toDTO = toDTO;
exports.toSlug = toSlug;
exports.getEnumValues = getEnumValues;
const class_transformer_1 = require("class-transformer");
function toDTO(DTOClass, data) {
    return (0, class_transformer_1.plainToClass)(DTOClass, data, {
        excludeExtraneousValues: true,
    });
}
function toSlug(str) {
    return str
        .trim()
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/([a-z])([A-Z])/g, "$1_$2")
        .replace(/[^a-zA-Z0-9_.]+/g, "_")
        .toUpperCase();
}
function getEnumValues(enumType) {
    return Array.from(new Set(Object.keys(enumType)
        .filter((key) => isNaN(Number(key))) // Оставляем только строковые ключи
        .map((key) => enumType[key]) // Получаем значения из enum
        .filter((value) => typeof value === 'string') // Убираем нестроковые значения
    ));
}
//# sourceMappingURL=utils.js.map