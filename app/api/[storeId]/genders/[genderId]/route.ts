import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";

export async function GET(
    req: Request,
    { params }: { params: { genderId: string } }
) {
    try {
        if (!params.genderId) {
            return new NextResponse('Gender id is required', { status: 400 });
        }

        const gender = await prismadb.gender.findUnique({
            where: {
                id: params.genderId,
            },
        });

        return NextResponse.json(gender);

    } catch (err) {
        console.log('[GENDERS_GET]', err);
        return new NextResponse('Internal error', { status: 500 });
    }
};


export async function PATCH(
    req: Request,
    { params }: { params: { storeId: string, genderId: string } }
) {
    try {

        const { userId } = auth();
        const body = await req.json();

        const { name, value } = body;

        if (!userId) {
            return new NextResponse('Unauthenticated', { status: 401 });
        }

        if (!name) {
            return new NextResponse('Name is required', { status: 400 });
        }

        if (!value) {
            return new NextResponse('Value is required', { status: 400 });
        }

        if (!params.genderId) {
            return new NextResponse('Gender id is required', { status: 400 });
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

        const gender = await prismadb.gender.updateMany({
            where: {
                id: params.genderId,
            },
            data: {
                name,          // this data is being updated!
                value
            }
        });

        return NextResponse.json(gender);

    } catch (err) {
        console.log('[GENDERS_PATCH]', err);
        return new NextResponse('Internal error', { status: 500 });
    }
};

export async function DELETE(
    req: Request,
    { params }: { params: { storeId: string, genderId: string } }
) {
    try {

        const { userId } = auth();

        if (!userId) {
            return new NextResponse('Unauthenticated', { status: 401 });
        }

        if (!params.genderId) {
            return new NextResponse('Gender id is required', { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        });

        if (!storeByUserId) {
            return new NextResponse('Unathorized', { status: 403 });
        }

        const gender = await prismadb.gender.deleteMany({
            where: {
                id: params.genderId,
            },
        });

        return NextResponse.json(gender);

    } catch (err) {
        console.log('[GENDERS_DELETE]', err);
        return new NextResponse('Internal error', { status: 500 });
    }
};