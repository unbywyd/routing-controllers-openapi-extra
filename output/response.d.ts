export declare function getOpenAPIResponse<T>(responseClass: new () => T, options?: {
    isArray?: boolean;
}): {
    "400": {
        description: string;
        content: {
            "application/json": {
                schema: {
                    $ref: string;
                };
            };
        };
    };
    "200": {
        description: string;
        content: {
            "application/json": {
                schema: {
                    type: string;
                    items: {
                        $ref: string;
                    };
                    $ref?: undefined;
                } | {
                    $ref: string;
                    type?: undefined;
                    items?: undefined;
                };
            };
        };
    };
};
export declare class IResponseErrorMessage {
    message: string;
    slug: string;
}
export declare class IResponseError {
    message: string;
    errors: Array<IResponseErrorMessage>;
    status: number;
    constructor(_message: string | Error, status?: number);
}
export type APIResponse<T> = T | IResponseError;
export declare class OutputSuccessOrFailDTO {
    success: boolean;
}
export declare function successOrFailResponse(success: boolean): OutputSuccessOrFailDTO;
export declare function Summary(summary: string): (...args: [Function] | [object, string, PropertyDescriptor]) => void;
export declare function SuccessResponse<T>(responseClass: new () => T, options?: {
    isArray?: boolean;
}): (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void;
export declare function responseError(message: string | Error, status?: number): IResponseError;
export declare function responseSuccess<T>(data: T): APIResponse<T>;
//# sourceMappingURL=response.d.ts.map