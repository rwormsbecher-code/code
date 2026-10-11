
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import z from "zod";
import { ProductService } from "../services/ProductService";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
    name: "ecommerce-custom-mcp",
    version: "1.0.0"
});

const productService = new ProductService();

const ProductSchema = z.object({
    id: z.number().int().positive().optional(),
    sku: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),
    price: z.union([z.number().nonnegative(), z.string()]),
    quantity: z.number().int(),
    created_at: z.union([z.string(), z.date()]).optional(),
    updated_at: z.union([z.string(), z.date()]).optional(),
});

server.registerTool(
    "add-product", 
    {
        title: "Add Product",
        description: "Tool to add a new product to the ecommerce platform",
        inputSchema: {
            sku: z.string().min(1),
            name: z.string().min(1),
            description: z.string().optional().nullable(),
            price: z.number().nonnegative(),
            quantity: z.number().int().nonnegative(),
        },            
        outputSchema: ProductSchema.shape,
    },
    async ({sku, name, description, price, quantity}) => {
        const createdProduct = await productService.addProduct({sku, name, description, price, quantity});
        const structuredProduct = { ...createdProduct };

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(structuredProduct),
                },
            ],
            structuredContent: structuredProduct,
        };
    }
);

(async () => {
    const transport = new StdioServerTransport();
    await server.connect(transport);
})();