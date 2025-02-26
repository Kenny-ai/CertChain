import React from "react";
import { Button } from "../button";

const SuccessModal = () => {
    return (
        <div className="relative top-0 z-50">
            <div className="bg-accent h-screen"></div>
            <div className="h-80 w-80 flex flex-col items-center justify-center gap-4 absolute top-[calc(50vh-10rem)] left-[calc(50vw-10rem)] space-y-8 rounded-2xl lg:p-8 p-4 border-2 border-primary/10 hover:border-primary/50 transition-all duration-300 ease-in-out shadow-2xl shadow-primary/10 hover:shadow-primary/20 lg:min-w-[400px]">
                <p className="text-xl text-center">
                    Certificate successfully issued a degree of BSc. Computer
                    Science to 214916
                </p>
                <Button
                    variant={"default"}
                    className="bg-accent text-base lg:text-lg font-semibold py-6 px-2 w-fit rounded-md"
                >
                    OK
                </Button>
            </div>
        </div>
    );
};

export default SuccessModal;
