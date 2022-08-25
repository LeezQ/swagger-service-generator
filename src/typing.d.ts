export type ApiInfo = {
  [key: string]: {
    [key: string]: {
      summary?: string;
      description?: string;
      parameters?: {
        in?: string;
        type?: string;
        name?: string;
        $ref?: string;
        schema?: {
          type: string;
          $ref: string;
        };
        description?: string;
        required?: boolean;
      }[];
      consumes?: string[];
    };
  };
};

export type SwaggerJson = {
  swagger?: string;
  openapi?: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  host: string;
  basePath: string;
  schemes: string[];
  definitions: {
    [key: string]: {
      type: string;
      properties: {
        [key: string]: {
          type: string;
          description?: string;
          format?: string;
          items?: {
            $ref: string;
          };
          enum?: string[];
        };
      };
    };
  };

  paths: {
    [key: string]: {
      [key: string]: {
        summary?: string;
        description?: string;
        parameters?: {
          in?: string;
          type?: string;
          name?: string;
          $ref?: string;

          schema?: {
            type: string;
            $ref: string;
          };
          description?: string;
          required?: boolean;
        }[];
        response?: {
          [key: string]: {
            description: string;
            schema: {
              $ref: string;
            };
          };
        };
        requestBody?: {
          description: string;
          content: {
            [key: string]: {
              schema: {
                $ref: string;

                type: string;
              };
            };
          };
        };
        consumes?: string[];
      };
    };
  };

  components: {
    schemas: {
      [key: string]: {
        type: string;
        properties: {
          [key: string]: {
            type: string;
            description?: string;
            format?: string;
            items?: {
              $ref: string;
            };
            enum?: string[];
          };
        };
      };
    };
  };
};
