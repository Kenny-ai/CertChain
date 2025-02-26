"use client";
import AptosProvider from "@/utils/providers/aptosProvider";
import React from "react";

export default function VerifyLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <AptosProvider>{children}</AptosProvider>
        </>
    );
}
