"use client";

import { useState } from "react";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaTimes } from "react-icons/fa";

const navigation = [
    { name: "News", href: "/news" },
    { name: "Events", href: "/events" },
    { name: "VIP", href: "/vip" },
    { name: "Remember Betty", href: "https://www.rememberbetty.com/" },
    { name: "Media", href: "/media" },
];

export function Header2() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="bg-black text-white sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div>
                        <a href="/" className="-m-1.5 p-1.5">
                            <span className="sr-only">NKOTB</span>
                            <img
                                alt="NKOTB"
                                src="/logo-white.png"
                                className="h-9 w-auto"
                            />
                        </a>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className="text-white hover:text-gray-300 font-bold uppercase text-sm tracking-wider transition-colors"
                            >
                                {item.name}
                            </a>
                        ))}
                    </div>

                    {/* Social Icons */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <a href="https://www.facebook.com/nkotb" target="_blank" rel="noopener noreferrer">
                            <FaFacebookF className="w-5 h-5 text-white hover:text-gray-300 cursor-pointer transition-colors" />
                        </a>
                        <a href="https://x.com/nkotb" target="_blank" rel="noopener noreferrer">
                            <FaTwitter className="w-5 h-5 text-white hover:text-gray-300 cursor-pointer transition-colors" />
                        </a>
                        <a href="https://www.instagram.com/nkotb/" target="_blank" rel="noopener noreferrer">
                            <FaInstagram className="w-5 h-5 text-white hover:text-gray-300 cursor-pointer transition-colors" />
                        </a>
                        <a href="https://www.youtube.com/nkotb" target="_blank" rel="noopener noreferrer">
                            <FaYoutube className="w-5 h-5 text-white hover:text-gray-300 cursor-pointer transition-colors" />
                        </a>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden text-white p-2"
                    >
                        <div className="w-6 h-0.5 bg-white mb-1"></div>
                        <div className="w-6 h-0.5 bg-white mb-1"></div>
                        <div className="w-6 h-0.5 bg-white"></div>
                    </button>
                </div>

                {/* Mobile Menu with Side Transition from Right */}
                {mobileMenuOpen && (
                    <div
                        className="lg:hidden fixed inset-0 w-[50%] bg-black bg-opacity-60 z-40"
                        style={{
                            transition: "transform 0.3s ease-out",
                            transform: mobileMenuOpen ? "translateX(0)" : "translateX(100%)", // Right-side slide-in
                        }}
                    >
                        {/* Sidebar Content */}
                        <div
                            className="flex flex-col items-center space-y-6 py-10 bg-black text-white"
                            style={{ transform: "translateY(0)" }}
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="absolute top-4 right-4 text-white"
                            >
                                <FaTimes className="w-6 h-6" />
                            </button>

                            {/* Navigation Links */}
                            {navigation.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className="text-white hover:text-gray-300 font-bold uppercase text-sm tracking-wider"
                                >
                                    {item.name}
                                </a>
                            ))}

                            {/* Social Icons */}
                            <div className="flex items-center space-x-4 mt-6">
                                <a href="https://www.facebook.com/nkotb" target="_blank" rel="noopener noreferrer">
                                    <FaFacebookF className="w-5 h-5 text-white hover:text-gray-300 cursor-pointer transition-colors" />
                                </a>
                                <a href="https://x.com/nkotb" target="_blank" rel="noopener noreferrer">
                                    <FaTwitter className="w-5 h-5 text-white hover:text-gray-300 cursor-pointer transition-colors" />
                                </a>
                                <a href="https://www.instagram.com/nkotb/" target="_blank" rel="noopener noreferrer">
                                    <FaInstagram className="w-5 h-5 text-white hover:text-gray-300 cursor-pointer transition-colors" />
                                </a>
                                <a href="https://www.youtube.com/nkotb" target="_blank" rel="noopener noreferrer">
                                    <FaYoutube className="w-5 h-5 text-white hover:text-gray-300 cursor-pointer transition-colors" />
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}
