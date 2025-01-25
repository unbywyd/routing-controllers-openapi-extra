import { NextFunction, Request, Response } from "express";
export declare class AsyncResolver {
    private static tasks;
    static addTask(task: Promise<any>): void;
    static resolveAll(): Promise<void>;
}
export declare function FixArrayJsonSchemaReference(reference: any): PropertyDecorator;
export declare function FixItemJsonSchemaReference(reference: any): PropertyDecorator;
export declare function IsEntity(typeFunction: () => Promise<Function> | Function, options?: {
    each: boolean;
}): PropertyDecorator;
export declare function ReferenceModel<T>(modelName: T): PropertyDecorator;
export declare function UseJsonBody(): MethodDecorator;
export declare function UseUrlencodedBody(extended?: boolean): MethodDecorator;
export declare function UseMultipart(): MethodDecorator;
export declare function RequestGuard(validator: (request: Request, response: Response, next: NextFunction) => Promise<true | {
    message: string;
    status?: number;
}>): (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => void;
export declare function RequestResolver<T>(extractor: (req: any, res: Response, next: Function) => Promise<any>, dtoClass?: new () => T): ParameterDecorator;
//# sourceMappingURL=decorators.d.ts.map