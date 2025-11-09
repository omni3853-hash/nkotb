import { Star } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-zinc-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 md:col-span-2">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <img
                alt="Premier Talent Agency"
                src="/logo-white.png"
                className="h-10 sm:h-12 w-auto"
              />
             
            </div>
            <p className="text-sm sm:text-base text-zinc-400 mb-4 sm:mb-6 max-w-md">
              Your premier destination for celebrity bookings. Connect with
              A-list stars, musicians, and influencers for your next event.
            </p>
            <div className="flex gap-3 sm:gap-4">
              <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                <span className="text-sm font-semibold">f</span>
              </div>
              <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                <span className="text-sm font-semibold">t</span>
              </div>
              <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                <span className="text-sm font-semibold">in</span>
              </div>
              <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors cursor-pointer">
                <span className="text-sm font-semibold">ig</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Celebrities
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Events
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Bookings
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Memberships
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Support</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
          <p className="text-zinc-400 text-xs sm:text-sm text-center sm:text-left">
            © 2025 Premier Talent Agency. All rights reserved.
          </p>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>Live Bookings</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Star className="size-4 text-yellow-400" />
              <span>4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
