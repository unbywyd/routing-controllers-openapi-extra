# routing-controllers-openapi-extra

A set of custom decorators and utilities for [routing-controllers](https://github.com/typestack/routing-controllers) and [routing-controllers-openapi](https://github.com/epiphone/routing-controllers-openapi). It simplifies file uploads, validation, and OpenAPI documentation generation in TypeScript/Node.js projects.

## Installation

```bash
npm install routing-controllers-openapi-extra
```

> **Important**: Make sure to enable `reflect-metadata` and set `experimentalDecorators` and `emitDecoratorMetadata` to `true` in your `tsconfig.json`.

```jsonc
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
    // ...
  }
}
```

## Features Overview

1. **AsyncResolver**

   - A helper class that collects and resolves Promises required for dynamic type definitions in decorators.

2. **Validation & JSON Schema References**

   - **`IsEntity(() => MyEntity, { each?: boolean })`**: Recursively validate nested objects or arrays of objects, dynamically resolved with `class-transformer`.
   - **`FixArrayJsonSchemaReference` / `FixItemJsonSchemaReference`**: Manually fix JSON schema references for arrays or single items.

3. **OpenAPI Body Decorators**

   - **`UseJsonBody`**: Automatically set up `bodyParser.json()` middleware and configure the OpenAPI request body schema.
   - **`UseUrlencodedBody`**: Use `bodyParser.urlencoded(...)` for form data.
   - **`UseMultipart`**: Set up `multer` for file uploads (any files), also annotates the request body in OpenAPI.

4. **Request Guard & Resolver**

   - **`RequestGuard`**: Custom request validation. Allows you to verify data before a controller method is called.
   - **`RequestResolver`**: Extract and optionally transform data into a DTO from request parameters, headers, etc.

5. **File Upload Handling**

   - **`UseMulter(MyDto)`**: Centralized file upload processing. Automatically reads file-field definitions from your DTO class.
   - **`IsFile`** / **`IsFiles`**: Decorators to mark which DTO fields are single or multiple file uploads, with min/max size and MIME validation.
   - **`BodyMultipart`**: Merge `req.body` and `req.files` into a single object for easier processing.

6. **OpenAPI Response Decorators**
   - **`SuccessResponse(MyResponseDto, { isArray?: boolean })`**: Adds a documented `200` response.
   - **`Summary`**: Sets the `summary` in OpenAPI for a specific controller method.
   - **`responseError` / `responseSuccess`**: Utility functions to unify error and success responses.

## Basic Example

```ts
import { Expose } from "class-transformer";
import {
  Summary,
  IsFiles,
  SuccessResponse,
  UseMulter,
  BodyMultipart,
  OutputSuccessOrFailDTO,
  successOrFailResponse,
} from "routing-controllers-openapi-extra";
import { IsString } from "class-validator";
import { Service } from "typedi";
import { OpenAPI } from "routing-controllers-openapi";
import FilesService from "./files.service";

export class InputFilesDTO {
  @IsFiles({
    maxFiles: 5,
    maxSize: "5MB",
  })
  @Expose()
  files: Express.Multer.File[];

  @Expose()
  @IsString()
  otherKey: string;
}

@Service()
@OpenAPI({
  tags: ["Files"],
})
@JsonController("/files")
export class FilesController {
  public constructor(private filesService: FilesService) {}

  @Summary("Upload public files")
  @SuccessResponse(UploadFileResponseDTO, { isArray: true })
  @Post("/upload/public")
  @UseMulter(InputFilesDTO)
  public async uploadPublicFiles(@BodyMultipart() data: InputFilesDTO) {
    return this.filesService.uploadFiles(data.files);
  }
}
```

## License

MIT. See the [LICENSE](./LICENSE) file for more details.
