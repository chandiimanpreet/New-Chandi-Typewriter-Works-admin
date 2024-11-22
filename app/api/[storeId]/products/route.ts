import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';

export async function POST(req: Request,
    { params }: { params: { storeId: string } }
) {
    try {
        const { userId } = auth();
        const body = await req.json();

        const {
            name,
            price,
            quantity,
            categoryId,
            images,
            isFeatured,
            isArchived
        } = body;

        if (!userId) {
            return new NextResponse('Unauthenticated', { status: 401 });
        }

        if (!name) {
            return new NextResponse('Name is required', { status: 400 });
        }

        if (!price) {
            return new NextResponse('Price is required', { status: 400 });
        }

        if (quantity !== 0 && !quantity) {
            return new NextResponse('Quantity is required', { status: 400 });
        }

        if (!categoryId) {
            return new NextResponse('Category id is required', { status: 400 });
        }

        if (!images || !images.length) {
            return new NextResponse('Images are required', { status: 400 });
        }

        if (!params.storeId) {
            return new NextResponse('Store id is required', { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse('Unauthorized', { status: 403 });
        }

        const product = await prismadb.product.create({
            data: {
                name,
                price,
                quantity,
                categoryId,
                isArchived,
                isFeatured,
                storeId: params.storeId,
                images: {
                    createMany: {
                        data: [
                            ...images.map((image: { url: string }) => image)
                        ]
                    }
                }
            }
        });

        return NextResponse.json(product);
    } catch (err) {
        console.log('[PRODUCT_POST]', err);
        return new NextResponse('Internal error', { status: 500 })
    }
};

export async function GET(req: Request,
    { params }: { params: { storeId: string } }
) {
    try {

        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId') || undefined;
        const isFeatured = searchParams.get('isFeatured');

        if (!params.storeId) {
            return new NextResponse('Store id is required', { status: 400 });
        }

        const products = await prismadb.product.findMany({
            where: {
                storeId: params.storeId,
                categoryId,
                isFeatured: isFeatured ? true : undefined,
                isArchived: false,
            },
            include: {
                images: true,
                category: true,
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        return NextResponse.json(products);
    } catch (err) {
        console.log('[PRODUCT_GET]', err);
        return new NextResponse('Internal error', { status: 500 })
    }
};