"use client";

import LoginForm from "./LoginForm";
import React from "react";

const LandingScreen: React.FC = () => {
    return (
        <div className="relative overflow-hidden" dir="rtl">
            <div className="bg-hero-section bg-no-repeat h-screen bg-center bg-cover">
                <video
                    autoPlay
                    loop
                    muted
                    webkit-playsinline="true"
                    playsInline
                    className="absolute inset-0 mx-auto object-cover h-screen xl:h-auto"
                >
                    <source src="/bg-video.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0">
                    {/*<Navbar />*/}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-4 sm:px-0 ">
                        {
                            /*!openSignUp && <LoginForm setOpenSignUp={setOpenSignUp} />}
            {openSignUp && <SignUpForm />*/
                            <LoginForm />
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingScreen;
