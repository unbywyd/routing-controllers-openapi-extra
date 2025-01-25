
import {
    ValidateNested
} from "class-validator";
import { Type } from "class-transformer";
import { JSONSchema } from "class-validator-jsonschema";

import bodyParser from 'body-parser';
import { NextFunction, Request, Response } from "express";
import { createParamDecorator, UseBefore } from "routing-controllers";
import multer from "multer";
import { OpenAPI } from "routing-controllers-openapi";
import { toDTO } from "./utils";

export class AsyncResolver {
    private static tasks: Promise<any>[] = [];

    public static addTask(task: Promise<any>) {
        this.tasks.push(task);
    }

    public static async resolveAll(): Promise<void> {
        if (this.tasks.length > 0) {
            await Promise.all(this.tasks);
        }
    }
}

export function FixArrayJsonSchemaReference(reference: any): PropertyDecorator {
    return JSONSchema({
        type: "array",
        items: {
            $ref: `#/components/schemas/${reference.name}`,
        },
    }) as PropertyDecorator;
}

export function FixItemJsonSchemaReference(reference: any): PropertyDecorator {
    return JSONSchema({
        $ref: `#/components/schemas/${reference.name}`,
    }) as PropertyDecorator;
}

function ApplyJsonSchemaType(type: any, target: Object, propertyKey: string | symbol, isArray: boolean) {
    if (type) {
        if (isArray) {
            FixArrayJsonSchemaReference(type)(target, propertyKey);
        } else {
            FixItemJsonSchemaReference(type)(target, propertyKey);
        }
    }
}

export function IsEntity(typeFunction: () => Promise<Function> | Function, options?: { each: boolean }): PropertyDecorator {
    const isArray = options?.each || false;
    return function (target: Object, propertyKey: string | symbol) {
        ValidateNested({ each: isArray })(target, propertyKey);

        const referenceType = typeFunction();
        Reflect.defineMetadata("design:itemtype", referenceType, target, propertyKey);

        if (referenceType instanceof Promise) {
            const task = referenceType.then(type => {
                Type(() => type)(target, propertyKey);
                ApplyJsonSchemaType(type, target, propertyKey, isArray);
            }).catch(err => {
                console.error("Error resolving type for property :" + String(propertyKey), err);
            });
            AsyncResolver.addTask(task);
        } else {
            Type(() => referenceType)(target, propertyKey);
            ApplyJsonSchemaType(referenceType, target, propertyKey, isArray);
        }
    };
}

export function ReferenceModel<T>(modelName: T): PropertyDecorator {
    return (target, propertyKey) => {
        JSONSchema({
            description: `@reference ${modelName}`,
        })(target, propertyKey as string);
    };
}

export function UseJsonBody(): MethodDecorator {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        UseBefore(bodyParser.json())(target, propertyKey, descriptor);

        OpenAPI({
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

export function UseUrlencodedBody(extended: boolean = true): MethodDecorator {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        UseBefore(bodyParser.urlencoded({ extended }))(target, propertyKey, descriptor);

        OpenAPI({
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

export function UseMultipart(): MethodDecorator {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const upload = multer();
        UseBefore(upload.any())(target, propertyKey, descriptor);

        // Добавляем описание для OpenAPI
        OpenAPI({
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


export function RequestGuard(
    validator: (request: Request, response: Response, next: NextFunction) => Promise<true | { message: string, status?: number }>,
) {
    return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) {
        UseBefore(async (req: Request, res: Response, next: NextFunction) => {
            try {
                const isValid = await validator(req, res, next);
                if (isValid !== true) {
                    const message = isValid?.message || "Access denied: Invalid data";
                    const status = isValid?.status || 403;
                    return res.status(status).send({ status: status, message: message });
                }
                next();
            } catch (err) {
                console.error(err);
                return res.status(500).send({ status: 500, message: "Server error during validation" });
            }
        })(target, propertyKey, descriptor);
    };
}

export function RequestResolver<T>(
    extractor: (req: any, res: Response, next: Function) => Promise<any>,
    dtoClass?: new () => T
): ParameterDecorator {
    return createParamDecorator({
        required: true,
        async value(action) {
            const { request, response, next } = action;
            try {
                const rawData = await extractor(request, response, next);
                if (!rawData) {
                    return null;
                }
                if (dtoClass) {
                    return toDTO(dtoClass, rawData);
                } else {
                    return rawData;
                }
            } catch (error) {
                console.error("RequestResolver error:", error);
                return null;
            }
        },
    });
} 
