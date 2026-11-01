import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { COLORS } from "@/theme/themeConstants";

export default function NavBar({ onSignInClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav
        className="w-full flex items-center justify-between px-8 py-2 relative z-50"
        style={{ backgroundColor: COLORS.background }}
      >
        <Link href="/">
          <Image
            src="/assets/icons/logo.jpg"
            alt="Logo"
            width={240}
            height={80}
            priority
            className="my-2 object-contain w-48 sm:w-56"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-12 text-base font-medium" style={{ color: COLORS.text }}>
          <Link href="/" style={{ color: COLORS.primary }} className="hover:text-accent transition-colors">Home</Link>
          <Link href="/#courses" style={{ color: COLORS.primary }} className="hover:text-accent transition-colors">Courses</Link>
          <Link href="/#events" style={{ color: COLORS.primary }} className="hover:text-accent transition-colors">Events</Link>
          <Link href="/#about" style={{ color: COLORS.primary }} className="hover:text-accent transition-colors">About</Link>
        </div>

        {/* Desktop Sign In Button */}
        <button
          className="hidden md:block px-6 py-2 rounded-full font-semibold shadow-card transition-colors"
          style={{ backgroundColor: COLORS.primary, color: COLORS.background }}
          onClick={onSignInClick}
        >
          Sign in
        </button>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <X size={24} style={{ color: COLORS.primary }} />
          ) : (
            <Menu size={24} style={{ color: COLORS.primary }} />
          )}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMenu}>
          <div
            className="fixed top-0 right-0 h-full w-80 max-w-[90vw] shadow-xl transform transition-transform duration-300 ease-in-out"
            style={{ backgroundColor: COLORS.background }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className="text-lg font-semibold" style={{ color: COLORS.primary }}>Menu</span>
                <button
                  onClick={toggleMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={24} style={{ color: COLORS.primary }} />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <div className="flex flex-col flex-1 px-4 py-6">
                <div className="space-y-4">
                  <Link
                    href="/"
                    className="block py-3 px-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors"
                    style={{ color: COLORS.primary }}
                    onClick={toggleMenu}
                  >
                    Home
                  </Link>
                  <Link
                    href="/#courses"
                    className="block py-3 px-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors"
                    style={{ color: COLORS.primary }}
                    onClick={toggleMenu}
                  >
                    Courses
                  </Link>
                  <Link
                    href="/#events"
                    className="block py-3 px-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors"
                    style={{ color: COLORS.primary }}
                    onClick={toggleMenu}
                  >
                    Events
                  </Link>
                  <Link
                    href="/#about"
                    className="block py-3 px-4 rounded-lg text-lg font-medium hover:bg-gray-100 transition-colors"
                    style={{ color: COLORS.primary }}
                    onClick={toggleMenu}
                  >
                    About
                  </Link>
                </div>

                {/* Mobile Sign In Button */}
                <div className="mt-auto pt-6 border-t border-gray-200">
                  <button
                    className="w-full py-3 px-4 rounded-full font-semibold shadow-card transition-colors text-lg"
                    style={{ backgroundColor: COLORS.primary, color: COLORS.background }}
                    onClick={() => {
                      onSignInClick();
                      toggleMenu();
                    }}
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}