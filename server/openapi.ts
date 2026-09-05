export const openApiDocument = {
  openapi: "3.0.0",

  info: {
    title:
      "Warranty Tracker API",

    version: "1.0.0",

    description:
      "Backend API for Warranty Tracker.",
  },

  servers: [
    {
      url:
        "http://localhost:3001",
    },
  ],

  paths: {
    "/api/health": {
      get: {
        summary:
          "Check API health",

        responses: {
          "200": {
            description:
              "API is running.",

            content: {
              "application/json": {
                schema: {
                  type: "object",

                  properties: {
                    status: {
                      type: "string",

                      example:
                        "ok",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/analyze-receipt": {
      post: {
        summary:
          "Analyze a receipt",

        description:
          "Extract product, transaction, and warranty information from a receipt using AI.",

        requestBody: {
          required: true,

          content: {
            "multipart/form-data": {
              schema: {
                type: "object",

                required: [
                  "receipt",
                ],

                properties: {
                  receipt: {
                    type: "string",

                    format:
                      "binary",

                    description:
                      "PDF or supported image receipt.",
                  },
                },
              },
            },
          },
        },

        responses: {
          "200": {
            description:
              "Successfully extracted receipt information.",

            content: {
              "application/json": {
                schema: {
                  $ref:
                    "#/components/schemas/ReceiptAnalysis",
                },
              },
            },
          },

          "400": {
            description:
              "Invalid request.",
          },

          "500": {
            description:
              "AI analysis failed.",
          },
        },
      },
    },
  },

  components: {
    schemas: {
      ReceiptAnalysis: {
        type: "object",

        properties: {
          product: {
            $ref:
              "#/components/schemas/ExtractedProduct",
          },

          warranty: {
            $ref:
              "#/components/schemas/ExtractedWarranty",
          },
        },

        required: [
          "product",
          "warranty",
        ],
      },

      ExtractedProduct: {
        type: "object",

        properties: {
          name: {
            type: "string",

            example:
              "26g High Protein Oats Dark Chocolate",
          },

          brand: {
            type: "string",

            example: "",
          },

          model: {
            type: "string",

            example: "",
          },

          purchaseDate: {
            type: "string",

            example:
              "2026-09-01",
          },

          purchasePrice: {
            type: "number",

            example:
              999,
          },

          currency: {
            type: "string",

            example:
              "INR",
          },

          seller: {
            type: "string",

            example:
              "",
          },

          dateEvidence: {
            type: "string",

            example:
              "01 September 23:16",
          },
        },

        required: [
          "name",
          "brand",
          "model",
          "purchaseDate",
          "purchasePrice",
          "currency",
          "seller",
          "dateEvidence",
        ],
      },

      ExtractedWarranty: {
        type: "object",

        properties: {
          found: {
            type: "boolean",

            example:
              false,
          },

          provider: {
            type: "string",

            example:
              "",
          },

          type: {
            type: "string",

            enum: [
              "manufacturer",
              "seller",
              "extended",
              "other",
            ],

            example:
              "other",
          },

          durationMonths: {
            type: "integer",

            example:
              0,
          },

          startDate: {
            type: "string",

            example:
              "",
          },
        },

        required: [
          "found",
          "provider",
          "type",
          "durationMonths",
          "startDate",
        ],
      },
    },
  },
};