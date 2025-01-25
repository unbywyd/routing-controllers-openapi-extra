
import { IsBoolean, IsNumber, IsString } from "class-validator";
import { Expose } from "class-transformer";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { OpenAPI } from "routing-controllers-openapi";
import { toSlug, toDTO } from "./utils";
import { IsEntity } from "./decorators";


export function getOpenAPIResponse<T>(
    responseClass: new () => T,
    options?: { isArray?: boolean }
) {
    const isArray = options?.isArray || false;
    const schemas = validationMetadatasToSchemas({
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

export class IResponseErrorMessage {
    @IsString()
    @Expose()
    message: string;

    @IsString()
    @Expose()
    slug: string;
}

export class IResponseError {
    @IsString()
    message: string;

    @IsEntity(() => IResponseErrorMessage, { each: true })
    errors: Array<IResponseErrorMessage> = [];

    @IsNumber()
    status: number = 401;

    constructor(_message: string | Error, status: number = 401) {
        const message = _message instanceof Error ? _message.message : _message;
        this.message = message;
        this.errors = [{ message, slug: toSlug(message) }];
        this.status = status;
    }
}

export type APIResponse<T> = T | IResponseError;
export class OutputSuccessOrFailDTO {
    @IsBoolean()
    @Expose()
    success: boolean;
}

export function successOrFailResponse(success: boolean): OutputSuccessOrFailDTO {
    return toDTO(OutputSuccessOrFailDTO, { success });
}

export function Summary(summary: string) {
    return OpenAPI((operation: any) => {
        operation.summary = summary;
        return operation;
    });
}

export function SuccessResponse<T>(
    responseClass: new () => T,
    options?: { isArray?: boolean }
) {
    return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
        const newResponses = getOpenAPIResponse(responseClass, options);

        return OpenAPI((operation: any) => {
            operation.responses = {
                ...(operation.responses || {}),
                ...newResponses,
            };

            return operation;
        })(target, propertyKey, descriptor);
    };
}

export function responseError(
    message: string | Error,
    status: number = 401
): IResponseError {
    return new IResponseError(message, status);
}

export function responseSuccess<T>(data: T): APIResponse<T> {
    return data;
}

