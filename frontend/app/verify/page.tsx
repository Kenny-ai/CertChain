"use client";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

import { Button } from "@/components/ui/button";
import { Tables } from "@/types_db";
import { createClient } from "@/utils/supabase/client";
import React, { useState } from "react";

export default function Verify() {
    const supabase = createClient();

    const [certificateHash, setCertificateHash] = useState("");
    const [showStudentData, setShowStudentData] = useState(false);

    const [errorOccured, setErrorOccured] = useState("");

    const [user, setUser] = useState<Tables<"users">>();
    const [certificate, setCertificate] = useState<Tables<"certificates">>();

    const [verifying, setVerifying] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCertificateHash(e.target.value);
    };

    const aptosConfig = new AptosConfig({ network: Network.TESTNET });
    const aptos = new Aptos(aptosConfig);

    async function verifyCertificate(e: React.FormEvent) {
        e.preventDefault();
        setVerifying(true);
        setErrorOccured("");
        setShowStudentData(false);

        try {
            // Fetch certificate details from Supabase
            const { data, error } = await supabase
                .from("certificates")
                .select("certificate_hash, id")
                .eq("certificate_hash", certificateHash);
            if (error) throw error;

            const certificateId = data[0].id;
            const address =
                "0x7be6c2e59ec67eb7b22f1f9cc4b608e31daaf21a1c68c5269d7ebbb9433c201e";

            // Verify on-chain state
            const certificateData = await aptos.view({
                payload: {
                    function:
                        "0x7be6c2e59ec67eb7b22f1f9cc4b608e31daaf21a1c68c5269d7ebbb9433c201e::issue_certificate::get_certificate",
                    functionArguments: [address, certificateId]
                }
            });
            const onChainData = certificateData[0];
            const isValidOnChain =
                onChainData === `Hashed certificate: ${certificateHash}`;

            // Return verification result
            const isVerified = isValidOnChain;
            console.log("Certificate verified:", isVerified);
            console.log("On-chain data:", onChainData);
            setVerifying(false);
            if (isVerified) {
                const { data: certificateDBData, error: certificateDataError } =
                    await supabase
                        .from("certificates")
                        .select()
                        .eq("certificate_hash", `${certificateHash}`);

                if (certificateDataError) {
                    console.error(
                        "Error fetching certificates:",
                        certificateDataError?.message
                    );
                    setErrorOccured(`An error occured. Please try again`);
                    return;
                }

                if (certificateDBData) {
                    setCertificate(certificateDBData![0]);
                    const matric_number =
                        certificateDBData![0].matric_numbers![0];

                    const { data: userData, error: userDataError } =
                        await supabase
                            .from("users")
                            .select()
                            .eq("matric_number", `${matric_number}`);

                    if (userDataError) {
                        console.error(
                            "Error fetching user:",
                            userDataError?.message
                        );
                        setErrorOccured(`An error occured. Please try again`);
                        return;
                    }

                    if (userData) {
                        setUser(userData[0]);
                        console.log(userData);
                        setShowStudentData(true);
                    }
                }
            }

            return isVerified;
        } catch (error) {
            console.error("Verification failed:", error);
            setErrorOccured("Certificate resource not found!");
            setVerifying(false);
            return false;
        }
    }

     return (
        <section className="mb-32 ">
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
