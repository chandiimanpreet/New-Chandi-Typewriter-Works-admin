'use client';

import { z } from "zod";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { Category, Color, Image, Product, Size, Gender } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/Heading";
import { Separator } from "@/components/ui/separator";
import ImageUpload from "@/components/ui/image-upload";
import { AlertModal } from "@/components/modals/alert-modal";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
    name: z.string().min(1),
    images: z.object({ url: z.string() }).array(),
    price: z.coerce.number().min(1),
    quantity: z.coerce.number().min(0),
    categoryId: z.string().min(1),
    sizeId: z.string().min(1),
    colorId: z.string().min(1),
    genderId: z.string().min(1),
    isArchived: z.boolean().default(false).optional(),
    isFeatured: z.boolean().default(false).optional(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
    initialData: Product & {
        images: Image[]
    } | null;
    categories: Category[];
    sizes: Size[];
    colors: Color[];
    genders: Gender[];
};

export const ProductForm: React.FC<ProductFormProps> = ({
    initialData,
    categories,
    sizes,
    colors,
    genders,
}) => {

    const params = useParams();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? 'Edit product' : 'Create product';
    const description = initialData ? 'Edit a product' : 'Add a new product';
    const toastMessage = initialData ? 'Product updated.' : 'Product created.';
    const action = initialData ? 'Save changes' : 'Create';

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            ...initialData,
            price: parseFloat(String(initialData?.price)),
            quantity: parseFloat(String(initialData?.quantity))
        } : {
            name: '',
            images: [],
            price: 0,
            quantity: 0,
            categoryId: '',
            colorId: '',
            sizeId: '',
            genderId: '',
            isFeatured: false,
            isArchived: false,
        }
    });

    const onSubmit = async (data: ProductFormValues) => {

        
        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data);
            } else {
                console.log(data.quantity);
                await axios.post(`/api/${params.storeId}/products`, data);
            }
            router.refresh();
            router.push(`/${params.storeId}/products`);
            toast.success(toastMessage);
        } catch (err) {
            console.log(err);
            toast.error('Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const onDelete = async () => {
        try {
            setLoading(true);
            await axios.delete(`/api/${params.storeId}/products/${params.productId}`);
            router.refresh();
            router.push(`/${params.storeId}/products`);
            toast.success('Product deleted.');
        } catch (err) {
            toast.error('Something went wrong!');
        }
        finally {
            setLoading(false);
            setOpen(false);
        }
    };

    return (
        <>
            <AlertModal isOpen={open} onClose={() => setOpen(false)}
                onConfirm={onDelete} loading={loading} />
            <div className="flex items-center justify-between">
                <Heading
                    title={title}
                    description={description}
                />
                {
                    initialData && (
                        <Button
                            disabled={loading}
                            variant="destructive"
                            size="icon"
                            onClick={() => setOpen(true)}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    )
                }
            </div>
            <Separator />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full" >
                    <FormField name="images" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Images</FormLabel>
                            <FormControl>
                                <ImageUpload
                                    value={field.value.map((image) => image.url)}
                                    disabled={loading}
                                    onChange={(url) => field.onChange([...field.value, { url }])}
                                    onRemove={(url) => field.onChange([...field.value.filter((current) => current.url !== url)])}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <div className="grid grid-cols-3 gap-8">
                        <FormField name="name" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Product name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField name="price" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input type="number" disabled={loading} placeholder="9.99" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField name="quantity" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                    <Input type="number" disabled={loading} placeholder="1" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField name="categoryId" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select
                                    disabled={loading}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue
                                                defaultValue={field.value}
                                                placeholder="Select a category"
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField name="genderId" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select
                                    disabled={loading}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue
                                                defaultValue={field.value}
                                                placeholder="Select a Gender"
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {genders.map((gender) => (
                                            <SelectItem
                                                key={gender.id}
                                                value={gender.id}
                                            >
                                                {gender.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField name="sizeId" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Size</FormLabel>
                                <Select
                                    disabled={loading}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue
                                                defaultValue={field.value}
                                                placeholder="Select a size"
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {sizes.map((size) => (
                                            <SelectItem
                                                key={size.id}
                                                value={size.id}
                                            >
                                                {size.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField name="colorId" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Color</FormLabel>
                                <Select
                                    disabled={loading}
                                    onValueChange={field.onChange}
                                    value={field.value}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue
                                                defaultValue={field.value}
                                                placeholder="Select a color"
                                            />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {colors.map((color) => (
                                            <SelectItem
                                                key={color.id}
                                                value={color.id}
                                            >
                                                {color.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField name="isFeatured" control={form.control} render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        // @ts-ignore
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Featured</FormLabel>
                                    <FormDescription>This product will appear on the home page.</FormDescription>
                                </div>
                            </FormItem>
                        )} />
                        <FormField name="isArchived" control={form.control} render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        // @ts-ignore
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Archived</FormLabel>
                                    <FormDescription>This product will not appear anywhere in the store.</FormDescription>
                                </div>
                            </FormItem>
                        )} />
                    </div>
                    <Button
                        disabled={loading}
                        className="ml-auto"
                        type="submit">{action}</Button>
                </form>
            </Form>
        </>
    )
};