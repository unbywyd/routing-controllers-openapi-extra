"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncResolver = void 0;
exports.FixArrayJsonSchemaReference = FixArrayJsonSchemaReference;
exports.FixItemJsonSchemaReference = FixItemJsonSchemaReference;
exports.IsEntity = IsEntity;
exports.ReferenceModel = ReferenceModel;
exports.UseJsonBody = UseJsonBody;
exports.UseUrlencodedBody = UseUrlencodedBody;
exports.UseMultipart = UseMultipart;
exports.RequestGuard = RequestGuard;
exports.RequestResolver = RequestResolver;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const class_validator_jsonschema_1 = require("class-validator-jsonschema");
const body_parser_1 = __importDefault(require("body-parser"));
const routing_controllers_1 = require("routing-controllers");
const multer_1 = __importDefault(require("multer"));
const routing_controllers_openapi_1 = require("routing-controllers-openapi");
const utils_1 = require("./utils");
class AsyncResolver {
    static tasks = [];
    static addTask(task) {
        this.tasks.push(task);
    }
    static async resolveAll() {
        if (this.tasks.length > 0) {
            await Promise.all(this.tasks);
        }
    }
}
exports.AsyncResolver = AsyncResolver;
function FixArrayJsonSchemaReference(reference) {
    return (0, class_validator_jsonschema_1.JSONSchema)({
        type: "array",
        items: {
            $ref: `#/components/schemas/${reference.name}`,
        },
    });
}
function FixItemJsonSchemaReference(reference) {
    return (0, class_validator_jsonschema_1.JSONSchema)({
        $ref: `#/components/schemas/${reference.name}`,
    });
}
function ApplyJsonSchemaType(type, target, propertyKey, isArray) {
    if (type) {
        if (isArray) {
            FixArrayJsonSchemaReference(type)(target, propertyKey);
        }
        else {
            FixItemJsonSchemaReference(type)(target, propertyKey);
        }
    }
}
function IsEntity(typeFunction, options) {
    const isArray = options?.each || false;
    return function (target, propertyKey) {
        (0, class_validator_1.ValidateNested)({ each: isArray })(target, propertyKey);
        const referenceType = typeFunction();
        Reflect.defineMetadata("design:itemtype", referenceType, target, propertyKey);
        if (referenceType instanceof Promise) {
            const task = referenceType.then(type => {
                (0, class_transformer_1.Type)(() => type)(target, propertyKey);
                ApplyJsonSchemaType(type, target, propertyKey, isArray);
            }).catch(err => {
                console.error("Error resolving type for property :" + String(propertyKey), err);
            });
            AsyncResolver.addTask(task);
        }
        else {
            (0, class_transformer_1.Type)(() => referenceType)(target, propertyKey);
            ApplyJsonSchemaType(referenceType, target, propertyKey, isArray);
        }
    };
}
function ReferenceModel(modelName) {
    return (target, propertyKey) => {
        (0, class_validator_jsonschema_1.JSONSchema)({
            description: `@reference ${modelName}`,
        })(target, propertyKey);
    };
}
function UseJsonBody() {
    return function (target, propertyKey, descriptor) {
        (0, routing_controllers_1.UseBefore)(body_parser_1.default.json())(target, propertyKey, descriptor);
        (0, routing_controllers_openapi_1.OpenAPI)({
            requestBody: {
                required: true,
                content: {
                    "application/json": {
                        schema: {
                            type: "object",
                        },
                    },
                },
            },
        })(target, propertyKey, descriptor);
    };
}
function UseUrlencodedBody(extended = true) {
    return function (target, propertyKey, descriptor) {
        (0, routing_controllers_1.UseBefore)(body_parser_1.default.urlencoded({ extended }))(target, propertyKey, descriptor);
        (0, routing_controllers_openapi_1.OpenAPI)({
            requestBody: {
                required: true,
                content: {
                    "application/x-www-form-urlencoded": {
                        schema: {
                            type: "object",
                        },
                    },
                },
            },
        })(target, propertyKey, descriptor);
    };
}
function UseMultipart() {
    return function (target, propertyKey, descriptor) {
        const upload = (0, multer_1.default)();
        (0, routing_controllers_1.UseBefore)(upload.any())(target, propertyKey, descriptor);
        // Добавляем описание для OpenAPI
        (0, routing_controllers_openapi_1.OpenAPI)({
            requestBody: {
                required: true,
                content: {
                    "multipart/form-data": {
                        schema: {
                            type: "object",
                        },
                    },
                },
            },
        })(target, propertyKey, descriptor);
    };
}
function RequestGuard(validator) {
    return function (target, propertyKey, descriptor) {
        (0, routing_controllers_1.UseBefore)(async (req, res, next) => {
            try {
                const isValid = await validator(req, res, next);
                if (isValid !== true) {
                    const message = isValid?.message || "Access denied: Invalid data";
                    const status = isValid?.status || 403;
                    return res.status(status).send({ status: status, message: message });
                }
                next();
            }
            catch (err) {
                console.error(err);
                return res.status(500).send({ status: 500, message: "Server error during validation" });
            }
        })(target, propertyKey, descriptor);
    };
}
function RequestResolver(extractor, dtoClass) {
    return (0, routing_controllers_1.createParamDecorator)({
        required: true,
        async value(action) {
            const { request, response, next } = action;
            try {
                const rawData = await extractor(request, response, next);
                if (!rawData) {
                    return null;
                }
                if (dtoClass) {
                    return (0, utils_1.toDTO)(dtoClass, rawData);
                }
                else {
                    return rawData;
                }
            }
            catch (error) {
                console.error("RequestResolver error:", error);
                return null;
            }
        },
    });
}
//# sourceMappingURL=decorators.js.map