"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import Input from "../input";
import React, { useEffect, useState } from "react";
import { Tables } from "@/types_db";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import NotConnected from "./NotConnected";
import { createClient } from "@/utils/supabase/client";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { sha256 } from "js-sha256";
import MultipleSelector, { Option } from "../multiple-selector";
import { ToastContainer, toast } from "react-toastify";

interface CustomOption extends Option {
    id: string;
}

const certificateFormSchema = z.object({
    title: z
        .string()
        .min(10, { message: "Title must be at least 10 characters long" })
        .max(60, { message: "Title cannot be longer than 60 characters" }),
    certificate_hash: z.string(),
    metadata: z.object({}).nullable(),
    user_ids: z
        .array(z.custom<CustomOption>())
        .min(1, { message: "Please add at least one user" }),
    issuing_institution_id: z.string(),
    graduation_year: z.string()
});

interface CreateCertificateProps extends React.ComponentPropsWithRef<"div"> {
    user: Partial<Tables<"users">>;
}

export default function CreateCertificate({
    user,
    ...otherProps
}: CreateCertificateProps & Record<string, any>) {
    const [loading, setLoading] = useState(false);
    const form = useForm<z.infer<typeof certificateFormSchema>>({
        resolver: zodResolver(certificateFormSchema),
        defaultValues: {
            title: "",
            certificate_hash: "",
            metadata: null,
            user_ids: [],
            issuing_institution_id: user.id,
            graduation_year: ""
        }
    });
    function generateCertificate(
        values: z.infer<typeof certificateFormSchema>
    ) {
        return JSON.stringify(values);
    }
    const supabase = createClient();
    const aptosConfig = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(aptosConfig);
    const [users, setUsers] = useState<Tables<"users">[] | null>(null);
    const [userInput, setUserInput] = useState<string>("");

    useEffect(() => {
        const getUsers = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from("users")
                    .select("*");
                console.log(data);
                if (error) {
                    console.log(error);
                    console.error(error);
                }
                if (!data) {
                    console.log(data);
                }
                setUsers(data);
            } catch (e: any) {
                console.log("Error while fetching users: " + e.message);
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        getUsers();
    }, []);
    useEffect(() => {
        const getUsers = async () => {
            try {
                setLoading(true);
                if (userInput.length < 3) {
                    return;
                }
                const { data, error } = await supabase
                    .from("users")
                    .select("*")
                    .like("full_name", `%${userInput}%`);
                if (error) {
                    console.log(error);
                    console.error(error);
                }
                if (!data) {
                    console.log(data);
                }
                // const data_ = data?.filter((user) => {
                //     // console.log(
                //     //     user.full_name
                //     //         ?.toLowerCase()
                //     //         .includes(userInput.toLowerCase())
                //     // );
                //     user.full_name
                //         ?.toLowerCase()
                //         .includes(userInput.toLowerCase());
                // }) as Tables<"users">[];
                setUsers(data);
                // console.log(users);
            } catch (e: any) {
                console.log("Error while fetching users: " + e.message);
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        getUsers();
    }, [userInput]);

    const onSignAndSubmitTransaction = async (
        certificateId: string,
        hashedCertificate: string
    ) => {
        // Validate certId
        if (typeof certificateId !== "string" || !certificateId) {
            throw new Error("certId must be a non-empty string");
        }
        console.log(
            "certId:",
            certificateId,
            "typeof certId:",
            typeof certificateId
        );
        console.log(
            "certificate_data:",
            `Hashed certificate: ${hashedCertificate}`
        );

        try {
            const response = await signAndSubmitTransaction({
                sender: account?.address,
                data: {
                    function:
                        "0x7be6c2e59ec67eb7b22f1f9cc4b608e31daaf21a1c68c5269d7ebbb9433c201e::issue_certificate::issue_certificate",
                    functionArguments: [
                        certificateId,
                        `Hashed certificate: ${hashedCertificate}`
                    ]
                }
            });

            return await aptos
                .waitForTransaction({ transactionHash: response.hash })
                .then(() => {
                    return response;
                });
        } catch (error) {
            console.error("Error signing and submitting transaction:", error);
        }
    };

    async function onSubmit(values: z.infer<typeof certificateFormSchema>) {
        console.log(
            `A certificate of ${values.title} has been successfully issued to ${values.user_ids[0].label.split("|")[1]}, ${values.user_ids[0].value}`
        );

        try {
            setLoading(true);
            const certificateData = generateCertificate(form.getValues());
            const certificateHash = sha256(certificateData);
            const certificateId = String(crypto.randomUUID());

            await onSignAndSubmitTransaction(
                certificateId,
                certificateHash
            ).then(async (txn) => {
                const { error } = await supabase.from("certificates").insert({
                    ...values,
                    id: certificateId,
                    title: values.title,
                    user_ids: values.user_ids.map((user) => user.id),
                    matric_numbers: values.user_ids.map((user) => user.value),
                    certificate_hash: certificateHash,
                    txn_id: txn.hash,
                    graduation_year: values.graduation_year,
                    issuing_institution_name: user.user_metadata.full_name
                });
                if (error) {
                    throw error;
                }

                toast.success(
                    `A certificate of ${values.title} has been successfully issued to ${values.user_ids[0].label.split("|")[1]}, ${values.user_ids[0].value}`,
                    {
                        className: "w-[400px] border border-purple-600/40",
                        theme: "dark"
                    }
                );

                console.log({
                    id: certificateId,
                    title: values.title,
                    user_ids: values.user_ids.map((user) => user.id),
                    certificate_hash: certificateHash,
                    txn_id: txn.hash
                });

                form.reset();
            });
        } catch (error) {
            console.error("Error submitting certificate form:", error);
        } finally {
            setLoading(false);
        }
    }

    const {
        connect,
        account,
        network,
        connected,
        disconnect,
        wallet,
        wallets,
        signAndSubmitTransaction,
        signTransaction,
        signMessage,
        signMessageAndVerify
    } = useWallet();

    // const [successModalOpen, setSuccessModalOpen] = useState(false);

    return (
        <div
            className="flex lg:justify-center lg:items-center items-start justify-start gap-16 w-1/2"
            {...otherProps}
        >
            <ToastContainer />
            {connected && (
                <div className="flex flex-col gap-4 lg:justify-center lg:items-center justify-start items-start w-full">
                    <h1 className="font-heading text-3xl font-bold inline-flex items-start justify-start flex-col">
                        Issue Certificates
                    </h1>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-8 rounded-2xl lg:p-8 p-4 border-2 border-primary/10 hover:border-primary/50 transition-all duration-300 ease-in-out shadow-2xl shadow-primary/10 hover:shadow-primary/20 lg:min-w-[400px] w-full"
                        >
                            <FormField
                                control={form.control}
                                name="title"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="lg:text-lg text-base">
                                            Certificate Title
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Certificate Title..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="user_ids"
                                render={({ field }) => (
                                    <FormItem
                                        onChange={(
                                            e: React.ChangeEvent<HTMLInputElement>
                                        ) => {
                                            setUserInput(e.target.value);
                                        }}
                                    >
                                        <FormLabel className="lg:text-lg text-base">
                                            Student Name and Matric number
                                        </FormLabel>
                                        <FormControl>
                                            {/* {
                                                console.log(
                                                    users,
                                                    selectedUsers
                                                ) as ReactNode
                                            } */}
                                            {/* <MultiSelect
                                                heading="Select Certificants"
                                                options={
                                                    users?.map((user) => ({
                                                        label:
                                                            user.full_name ??
                                                            "",
                                                        value:
                                                            user.full_name ?? ""
                                                    })) ?? []
                                                }
                                                selected={selectedUsers}
                                                onChange={(e) =>
                                                    setSelectedUsers(e)
                                                }
                                            /> */}
                                            <MultipleSelector
                                                options={
                                                    users?.map((user) => {
                                                        return {
                                                            label: `${user.matric_number} | ${user.full_name}`,
                                                            value:
                                                                user.matric_number ??
                                                                "",
                                                            id: user.id
                                                        };
                                                    }) ?? []
                                                }
                                                triggerSearchOnFocus={true}
                                                loadingIndicator={
                                                    <p>Loading...</p>
                                                }
                                                {...field}
                                            />
                                            {/* <div className="">
                                                <MultipleSelector
                                                options={options}
                                                value={selectedOptions}
                                                onChange={handleOptionsChange}
                                                placeholder="Select options..."
                                                groupBy="group" // Enable grouping
                                                creatable={true} // Enable creating new options
                                                onMaxSelected={(max) =>
                                                    alert(
                                                        `You can only select up to ${max} options.`
                                                    )
                                                }
                                                maxSelected={3}
                                                />
                                            <p>
                                                Selected Values:{" "}
                                                {selectedOptions
                                                    .map(
                                                        (option) => option.value
                                                    )
                                                    .join(", ")}
                                            </p>
                                            </div> */}
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="graduation_year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="lg:text-lg text-base">
                                            Graduation Year
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter student graduation year"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button
                                variant={"default"}
                                className="lg:text-lg font-heading font-semibold text-base py-6 w-full"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Loading..." : "Create Certificate"}
                            </Button>
                        </form>
                    </Form>
                </div>
            )}
            {!connected && <NotConnected />}
        </div>
    );
}
