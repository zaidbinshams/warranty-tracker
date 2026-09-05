import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import multer from "multer";
import swaggerUi from "swagger-ui-express";

import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

import { openApiDocument } from "./openapi";

dotenv.config();

const app = express();

const port = Number(
  process.env.PORT ?? 3001
);

const geminiApiKey =
  process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error(
    "GEMINI_API_KEY is missing. Make sure your .env file is in the project root."
  );
}

const ai = new GoogleGenAI({
  apiKey: geminiApiKey,
});

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument)
);

/* --------------------------------
   Health check
-------------------------------- */

app.get(
  "/api/health",
  (_req, res) => {
    res.json({
      status: "ok",
    });
  }
);

/* --------------------------------
   Response schemas
-------------------------------- */

const extractedProductSchema =
  z.object({
    name: z.string(),
    brand: z.string(),
    model: z.string(),
    purchaseDate:
      z.string(),
    purchasePrice:
      z.number(),
    currency:
      z.string(),
    seller:
      z.string(),

    /*
     * Useful for debugging and
     * future confidence handling.
     */
    dateEvidence:
      z.string(),
  });

const extractedWarrantySchema =
  z.object({
    found:
      z.boolean(),

    provider:
      z.string(),

    type: z.enum([
      "manufacturer",
      "seller",
      "extended",
      "other",
    ]),

    durationMonths:
      z.number().int(),

    startDate:
      z.string(),
  });

const receiptSchema = z.object({
  product:
    extractedProductSchema,

  warranty:
    extractedWarrantySchema,
});

/* --------------------------------
   Gemini response schema
-------------------------------- */

const receiptResponseSchema = {
  type: "object",

  properties: {
    product: {
      type: "object",

      properties: {
        name: {
          type: "string",

          description:
            "The exact product name shown on the receipt. Do not invent it. Return an empty string if unavailable.",
        },

        brand: {
          type: "string",

          description:
            "The product brand or manufacturer shown on the receipt. Return an empty string if unavailable.",
        },

        model: {
          type: "string",

          description:
            "The exact model number, model identifier, SKU, or equivalent identifier when clearly shown. Return an empty string if unavailable.",
        },

        purchaseDate: {
          type: "string",

          description:
            "The transaction/purchase/order/invoice date in YYYY-MM-DD format. Inspect the ENTIRE receipt for this date, including the header, order summary, bill summary, order number area, invoice area, and date/time fields. A date that appears next to an Order Number, Bill Number, Invoice Number, or transaction summary should normally be treated as the transaction date. If a date and time appear together, extract only the date. Never leave this blank when a clear transaction date is visible.",
        },

        purchasePrice: {
          type: "number",

          description:
            "The final amount paid for the transaction as a number. Prefer the grand total/final total over the subtotal. Return 0 if unavailable.",
        },

        currency: {
          type: "string",

          description:
            "Currency code such as INR, USD, EUR, or GBP. Infer from visible currency symbols/text when unambiguous. Return an empty string if unavailable.",
        },

        seller: {
          type: "string",

          description:
            "The merchant, retailer, marketplace, or store that issued the receipt. Return an empty string if unavailable.",
        },

        dateEvidence: {
          type: "string",

          description:
            "Copy the date/time text from the receipt that supports the purchaseDate. For example, if the receipt shows '01 September 23:16' next to an order summary, return that exact text. Return an empty string only if no transaction date is visible.",
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

    warranty: {
      type: "object",

      properties: {
        found: {
          type: "boolean",

          description:
            "True only when the receipt itself contains explicit warranty information. False when no reliable warranty information is present.",
        },

        provider: {
          type: "string",

          description:
            "Warranty provider explicitly identified on the receipt. Return an empty string if none is present.",
        },

        type: {
          type: "string",

          enum: [
            "manufacturer",
            "seller",
            "extended",
            "other",
          ],

          description:
            "Warranty type explicitly supported by the receipt. Use other when no warranty information is present.",
        },

        durationMonths: {
          type: "integer",

          description:
            "Warranty duration in months only when explicitly stated or unambiguously supported by the receipt. Return 0 when no warranty information is present.",
        },

        startDate: {
          type: "string",

          description:
            "Warranty start date in YYYY-MM-DD format when explicitly stated or reasonably supported. Return an empty string when no warranty information is present.",
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

  required: [
    "product",
    "warranty",
  ],
};

/* --------------------------------
   Analyze receipt
-------------------------------- */

app.post(
  "/api/analyze-receipt",
  upload.single("receipt"),

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error:
            "No receipt file was provided.",
        });
      }

      const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/webp",
      ];

      if (
        !allowedTypes.includes(
          req.file.mimetype
        )
      ) {
        return res.status(400).json({
          error:
            "Unsupported receipt type.",
        });
      }

      const base64Data =
        req.file.buffer.toString(
          "base64"
        );

      const prompt = `
You are a highly reliable receipt
information extraction system.

You are looking at an actual purchase
receipt image or PDF.

Your job is to identify information
VISIBLY PRESENT in the document.

IMPORTANT:

1. Inspect the ENTIRE document.

2. Do not focus only on the product
   section.

3. Pay particular attention to:
   - receipt header
   - order summary
   - bill summary
   - order number
   - invoice number
   - transaction information
   - dates and times
   - grand total

PURCHASE DATE:

4. The purchaseDate field MUST contain
   the transaction date whenever one is
   visibly present.

5. Search specifically for labels such as:
   - Order Date
   - Purchase Date
   - Invoice Date
   - Transaction Date
   - Bill Date

6. Also inspect dates that appear near:
   - Order #
   - Order number
   - Invoice #
   - Bill #
   - Transaction #
   - Grand Total
   - Bill Summary

7. If a date and time appear together,
   extract only the calendar date.

8. For example, if a receipt contains:

      Order #638939
      01 September 23:16

   then the purchaseDate should be:

      2026-09-01

   assuming the year is otherwise
   established by the document/context.

9. Put the exact visible source text used
   to determine the date into dateEvidence.

10. Do not leave purchaseDate empty
    merely because the receipt uses a
    date format different from YYYY-MM-DD.
    Convert the visible date to YYYY-MM-DD.

11. Do not invent a date when no reliable
    date exists.

PRODUCT:

12. Extract the actual purchased product.

13. For model, prefer a true model number
    when one is shown. Do not turn an
    unrelated order number into the model.

PRICE:

14. Prefer the final grand total or final
    amount paid.

15. Do not use a subtotal if a final total
    is clearly shown.

SELLER:

16. Identify the store, marketplace, or
    merchant that issued the receipt.

WARRANTY:

17. Warranty information must come ONLY
    from the receipt.

18. Do not assume that a product has a
    warranty simply because its brand or
    category normally has one.

19. If the receipt contains no warranty
    information, return:

      found = false
      provider = ""
      type = "other"
      durationMonths = 0
      startDate = ""

20. Return all dates as YYYY-MM-DD.

21. Return empty strings when string
    information is unavailable.

22. Return 0 for unavailable numeric
    information.

Return only the requested JSON structure.
`;

      const response =
        await ai.models.generateContent({
          model:
            "gemini-3.6-flash",

          contents: [
            {
              role: "user",

              parts: [
                {
                  text: prompt,
                },

                {
                  inlineData: {
                    mimeType:
                      req.file.mimetype,

                    data: base64Data,
                  },
                },
              ],
            },
          ],

          config: {
            responseMimeType:
              "application/json",

            responseSchema:
              receiptResponseSchema,
          },
        });

      const rawText =
        response.text;

      if (!rawText) {
        return res.status(502).json({
          error:
            "The AI service returned no result.",
        });
      }

      let parsed: unknown;

      try {
        parsed =
          JSON.parse(rawText);
      } catch {
        return res.status(502).json({
          error:
            "The AI service returned invalid JSON.",
        });
      }

      const validated =
        receiptSchema.safeParse(
          parsed
        );

      if (!validated.success) {
        console.error(
          "Invalid AI response:",
          validated.error
        );

        return res.status(502).json({
          error:
            "The AI response did not match the expected format.",
        });
      }

      return res.json(
        validated.data
      );
    } catch (error) {
      console.error(
        "Receipt analysis failed:",
        error
      );

      return res.status(500).json({
        error:
          "Receipt analysis failed.",
      });
    }
  }
);

/* --------------------------------
   Start server
-------------------------------- */

app.listen(
  port,
  () => {
    console.log(
      `Warranty Tracker API running on http://localhost:${port}`
    );
  }
);