export function Footer2() {
    return (
        <footer
            className="relative mt-auto text-white"
            style={{
                backgroundImage: 'url("/footerimage.png")', 
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            {/* Black overlay for readability */}
            <div className="absolute inset-0 bg-black opacity-90" aria-hidden="true" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
                {/* Top links */}
                <div className="flex flex-col sm:flex-row justify-center items-center text-center space-y-4 sm:space-y-0 sm:space-x-8 mb-8 mt-5">
                    <a
                        href="https://www.nkotb.com/terms"
                        className="text-xs sm:text-sm md:text-base font-medium uppercase tracking-[0.2em] hover:text-gray-200 transition-colors"
                    >
                        TERMS OF USE
                    </a>
                    <span className="hidden sm:inline text-gray-500">|</span>
                    <a
                        href="https://www.nkotb.com/vegas-flyaway-rules-and-regs"
                        className="text-xs sm:text-sm md:text-base font-medium uppercase tracking-[0.2em] hover:text-gray-200 transition-colors"
                    >
                        LAS VEGAS FLYAWAY SWEEPSTAKES RULES &amp; REGULATIONS
                    </a>
                    <span className="hidden sm:inline text-gray-500">|</span>
                    <a
                        href="https://www.nkotb.com/privacy-policy"
                        className="text-xs sm:text-sm md:text-base font-medium uppercase tracking-[0.2em] hover:text-gray-200 transition-colors"
                    >
                        PRIVACY POLICY
                    </a>
                    <span className="hidden sm:inline text-gray-500">|</span>
                    <a
                        href="mailto:info@nkotbapp.com?subject=NKOTB%20Inquiry"
                        className="text-xs sm:text-sm md:text-base font-medium uppercase tracking-[0.2em] hover:text-gray-200 transition-colors"
                    >
                        BLOCK NATION CUSTOMER SERVICE
                    </a>
                </div>

                {/* Bottom text */}
                <div className="text-center">
                    <p className="text-xs sm:text-sm md:text-base text-gray-300 tracking-wide">
                        © 2023 NEW KIDS ON THE BLOCK. ALL RIGHTS RESERVED
                    </p>
                </div>
            </div>
        </footer>
    );
}
