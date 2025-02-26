"use client";

import { Button } from "@/components/ui/button";
import { Tables } from "@/types_db";
import { createClient } from "@/utils/supabase/client";
import { AptosClient, HexString, Types } from "aptos";
import React, { useState } from "react";

export default function Verify() {
    const supabase = createClient();

    const accountAddress =
        "0x885a7d4b5b123ff86e3a853439bb11b1ac888b1ee7b403dc845c8bf62e6dd174";
    // const certificateData =
    //     "Hashed certificate: b8afc3eedae75c1d47266ddf965012f6fcc697c2fb8d51da36a1122ff09bdfe8";
    const network = "https://fullnode.testnet.aptoslabs.com/v1";
    const [certificateHash, setCertificateHash] = useState("");
    const [showStudentData, setShowStudentData] = useState(false);

    const [errorOccured, setErrorOccured] = useState("");

    const [user, setUser] = useState<Tables<"users">>();
    const [certificate, setCertificate] = useState<Tables<"certificates">>();

    const [verifying, setVerifying] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCertificateHash(e.target.value);
    };

    const verifyCertificate = async (e: React.FormEvent) => {
        e.preventDefault();
        setVerifying(true);
        setErrorOccured("");
        setShowStudentData(false);

        const certificateData = `Hashed certificate: ${certificateHash}`;

        const client = new AptosClient(network);
        const account = new HexString(accountAddress);
        const resourceType = `${accountAddress}::issue_certificate::CertificateHolder`;

        try {
            const resource = await client.getAccountResource(
                account,
                resourceType
            );
            console.log({ certificateHash, certificateData });
            if (resource.data.certificate_data === certificateData) {
                const { data: certificateData, error } = await supabase
                    .from("certificates")
                    .select()
                    .eq("certificate_hash", `${certificateHash}`);

                if (error) {
                    console.error(
                        "Error fetching certificates:",
                        error.message
                    );
                    setErrorOccured(`An error occured. Please try again`);
                    return;
                }

                if (certificateData) {
                    setCertificate(certificateData[0]);
                    const matric_number = certificateData[0].matric_numbers[0];

                    const { data: userData, error: userDataError } =
                        await supabase
                            .from("users")
                            .select()
                            .eq("matric_number", `${matric_number}`);

                    if (userData) {
                        setUser(userData[0]);
                        console.log(userData);
                        setShowStudentData(true);
                    }
                }

                console.log("Certificate resource found and data matches.");
            } else {
                setErrorOccured(
                    `Certificate resource found, but data does not match`
                );
                console.log(
                    "Certificate resource found, but data does not match."
                );
            }
        } catch (error) {
            setErrorOccured("Certificate resource not found!");
            console.log("Certificate resource not found.");
        }
        setVerifying(false);

        // try {
        //     const events = await client.getEventsByEventHandle(
        //         account,
        //         resourceType,
        //         "certificate_issued_events" //This will depend on how you name your event handle in your move module.
        //     );
        //     const foundEvent = events.find(
        //         (event: any) =>
        //             event.data.certificate_data === certificateData
        //     );
        //     if (foundEvent) {
        //         console.log("Certificate event found and data matches.");
        //     } else {
        //         console.log(
        //             "Certificate event not found or data does not match."
        //         );
        //     }
        // } catch (error) {
        //     console.log("Error querying events.");
        // }
    };

    // Example usage:

    // verifyCertificate(accountAddress, certificateData, network);
    // verifyCertificate();

    return (
        <section className="mb-32 ">
            {/* <SuccessModal /> */}
            <div className="py-8 flex lg:justify-center lg:items-center justify-start items-start sm:pt-24 px-8">
                <div className="max-w-4xl mb-2">
                    <h1 className="lg:text-6xl w-fit font-extrabold text-5xl">
                        {`Hello, there`}
                    </h1>
                    <p className="max-w-2xl lg:text-center w-full opacity-80 mt-2 lg:text-xl text-lg">
                        Welcome to the verification page
                    </p>
                </div>
            </div>
            <section className="flex justify-center items-center w-full">
                <form
                    onSubmit={verifyCertificate}
                    className="flex gap-8 w-full justify-center items-center"
                >
                    <input
                        type="text"
                        placeholder="Enter certificate hash here"
                        className="w-1/2 p-4 bg-transparent rounded-md placeholder:text-gray-500 border border-primary/10 hover:border-primary/50 transition-all duration-300 ease-in-out shadow shadow-primary/10 hover:shadow-primary/20 outline-offset-2 outline-none"
                        onChange={handleChange}
                    />
                    <Button
                        size={"xl"}
                        className="rounded p-4 border-2 border-primary"
                    >
                        {verifying ? `Verifying...` : `Verify Certificate`}
                    </Button>
                </form>
            </section>

            <div className="text-red-500 text-center mt-8">{errorOccured}</div>

            <div className="flex justify-center items-center  w-full">
                <div className="flex flex-row flex-wrap lg:justify-center lg:items-center items-start justify-start gap-8">
                    {/* <NameForm userName={userDetails?.full_name ?? ''} />
                          <EmailForm userEmail={user.email} /> */}
                </div>
            </div>
            {showStudentData && (
                <>
                    <h3 className="text-xl font-bold text-center mb-4">
                        Student Data
                    </h3>
                    <div className="flex items-center justify-center w-full">
                        <div className="w-[400px] lg:w-[600px] bg-transparent  text center border border-primary flex flex-col gap-6 rounded-xl p-4">
                            <p className="font-semibold">
                                Student Name: {user?.full_name}{" "}
                            </p>
                            <p className="font-semibold">
                                Student Matric Number: {user?.matric_number}
                            </p>
                            <p className="font-semibold">
                                Certificate Title: {certificate?.title}
                            </p>
                            <p className="font-semibold">
                                Year of Certificate Issuance:{" "}
                                {certificate?.graduation_year}
                            </p>
                        </div>{" "}
                    </div>
                </>
            )}
        </section>
    );
}
