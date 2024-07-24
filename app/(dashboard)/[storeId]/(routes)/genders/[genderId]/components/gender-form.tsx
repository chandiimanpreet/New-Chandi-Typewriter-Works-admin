'use client';

import { z } from "zod";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { Gender } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/Heading";
import { Separator } from "@/components/ui/separator";
import ImageUpload from "@/components/ui/image-upload";
import { AlertModal } from "@/components/modals/alert-modal";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const formSchema = z.object({
    name: z.string().min(1),
    value: z.string().min(1),
});

type GenderFormValues = z.infer<typeof formSchema>;

interface GenderFormProps {
    initialData: Gender | null;
};

export const GenderForm: React.FC<GenderFormProps> = ({ initialData }) => {

    const params = useParams();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const title = initialData ? 'Edit gender' : 'Create gender';
    const description = initialData ? 'Edit a gender' : 'Add a new gender';
    const toastMessage = initialData ? 'Gender updated.' : 'Gender created.';
    const action = initialData ? 'Save changes' : 'Create';

    const form = useForm<GenderFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name: '',
            value: '',
        }
    });

    const onSubmit = async (data: GenderFormValues) => {

        try {
            setLoading(true);
            if (initialData) {
                await axios.patch(`/api/${params.storeId}/genders/${params.genderId}`, data);
            } else {
                await axios.post(`/api/${params.storeId}/genders`, data);
            }
            router.push(`/${params.storeId}/genders`);
            router.refresh();
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
            await axios.delete(`/api/${params.storeId}/genders/${params.genderId}`);
            router.refresh();
            router.push(`/${params.storeId}/genders`);

            toast.success('Gender deleted.');
        } catch (err) {
            toast.error('Make sure you removed all products using this gender first.');
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
                    <div className="grid grid-cols-3 gap-8">
                        <FormField name="name" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Gender name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField name="value" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Value</FormLabel>
                                <FormControl>
                                    <Input disabled={loading} placeholder="Gender value" {...field} />
                                </FormControl>
                                <FormMessage />
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