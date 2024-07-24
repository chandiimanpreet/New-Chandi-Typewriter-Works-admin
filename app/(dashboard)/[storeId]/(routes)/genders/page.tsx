import { format } from 'date-fns';
 
import prismadb from "@/lib/prismadb";
import { GendersClient } from "./components/client";
import { GenderColumn } from "./components/columns";

const GendersPage = async ({ params }: {
    params: { storeId: string }
}) => {

    const genders = await prismadb.gender.findMany({
        where: {
            storeId: params.storeId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const formattedColors: GenderColumn[] = genders.map((item) => ({
        id: item.id,
        name: item.name,
        value: item.value,
        createdAt: format(item.createdAt, 'MMMM do, yyyy')
    }))

    return (
        <div className="flex-col" >
            <div className="flex-1 space-y-4 p-8 pt-6">
                <GendersClient data={formattedColors} />

            </div>
        </div>
    )
}

export default GendersPage;