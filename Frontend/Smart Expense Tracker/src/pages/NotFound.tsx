import type { FC } from "react";

export const NotFound: FC = () => {
    return (
        <div className="flex flex-col gap-7 bg-white dark:bg-black text-black dark:text-white items-center justify-center min-h-screen">
            <p className="text-2xl md:text-5xl  font-mono">Oh no a 404 page😞</p>
            <p className="text-xl md:text-2xl font-sans">We are sorry but seems like this page is not yet ready to access</p>
        </div>
    );
};
