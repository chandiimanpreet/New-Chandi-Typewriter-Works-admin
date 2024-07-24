import { PrismaClient } from "@prisma/client";
import { undefined } from "zod";

declare global {
    var prisma: PrismaClient | undefined
};

const prismadb = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
    globalThis.prisma = prismadb;
}

export default prismadb;

// mysql - h "viaduct.proxy.rlwy.net" - u root  --database railway -p < all_schema.sql