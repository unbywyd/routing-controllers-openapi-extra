"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutputSuccessOrFailDTO = exports.IResponseError = exports.IResponseErrorMessage = void 0;
exports.getOpenAPIResponse = getOpenAPIResponse;
exports.successOrFailResponse = successOrFailResponse;
exports.Summary = Summary;
exports.SuccessResponse = SuccessResponse;
exports.responseError = responseError;
exports.responseSuccess = responseSuccess;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const class_validator_jsonschema_1 = require("class-validator-jsonschema");
const routing_controllers_openapi_1 = require("routing-controllers-openapi");
const utils_1 = require("./utils");
const decorators_1 = require("./decorators");
function getOpenAPIResponse(responseClass, options) {
    const isArray = options?.each || false;
    const schemas = (0, class_validator_jsonschema_1.validationMetadatasToSchemas)({
        refPointerPrefix: "#/components/schemas/",
    });
    const schemaName = responseClass.name;
    if (!schemas[schemaName]) {
        throw new Error(`Schema not found for ${schemaName}`);
    }
    const schemaReference = isArray
        ? { type: "array", items: { $ref: `#/components/schemas/${schemaName}` } }
        : { $ref: `#/components/schemas/${schemaName}` };
    return {
        "400": {
            description: "Bad request",
            content: {
                "application/json": {
                    schema: {
                        $ref: `#/components/schemas/IResponseError`,
                    },
                },
            },
        },
        "200": {
            description: "Successful response",
            content: {
                "application/json": {
                    schema: schemaReference,
                },
            },
        },
    };
}
class IResponseErrorMessage {
    message;
    slug;
}
exports.IResponseErrorMessage = IResponseErrorMessage;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], IResponseErrorMessage.prototype, "message", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], IResponseErrorMessage.prototype, "slug", void 0);
class IResponseError {
    message;
    errors = [];
    status = 401;
    constructor(_message, status = 401) {
        const message = _message instanceof Error ? _message.message : _message;
        this.message = message;
        this.errors = [{ message, slug: (0, utils_1.toSlug)(message) }];
        this.status = status;
    }
}
exports.IResponseError = IResponseError;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], IResponseError.prototype, "message", void 0);
__decorate([
    (0, decorators_1.IsEntity)(() => IResponseErrorMessage, { each: true }),
    __metadata("design:type", Array)
], IResponseError.prototype, "errors", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], IResponseError.prototype, "status", void 0);
class OutputSuccessOrFailDTO {
    success;
}
exports.OutputSuccessOrFailDTO = OutputSuccessOrFailDTO;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], OutputSuccessOrFailDTO.prototype, "success", void 0);
function successOrFailResponse(success) {
    return (0, utils_1.toDTO)(OutputSuccessOrFailDTO, { success });
}
function Summary(summary) {
    return (0, routing_controllers_openapi_1.OpenAPI)((operation) => {
        operation.summary = summary;
        return operation;
    });
}
function SuccessResponse(responseClass, options) {
    return (target, propertyKey, descriptor) => {
        const newResponses = getOpenAPIResponse(responseClass, options);
        return (0, routing_controllers_openapi_1.OpenAPI)((operation) => {
            operation.responses = {
                ...(operation.responses || {}),
                ...newResponses,
            };
            return operation;
        })(target, propertyKey, descriptor);
    };
}
function responseError(message, status = 401) {
    return new IResponseError(message, status);
}
function responseSuccess(data) {
    return data;
}
//# sourceMappingURL=response.js.map