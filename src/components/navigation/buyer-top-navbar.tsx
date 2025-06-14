"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, Menu, Bell, ShoppingCart, User, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "~/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { ThemeSelector } from "~/components/ui/theme-selector";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "~/components/ui/navigation-menu";

export function BuyerTopNavbar() {
  const { data: session } = useSession();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen);

  // CSS classes
  const navLinkClasses = "text-sm font-medium text-white/90 hover:text-white transition-colors duration-200";
  const searchBtnClasses = "rounded-full text-white hover:bg-white/10 transition-colors duration-200";
  const mobileNavLinkClasses =
    "py-2 text-lg font-medium text-white hover:text-white/80 transition-colors duration-200";

  return (    <header className="sticky top-0 z-50 bg-gradient-brand text-white shadow-2xl backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-4">{/* Desktop Header */}
        <div className="hidden items-center justify-between md:flex">
          <Link href="/buyer" className="flex items-center transition-opacity hover:opacity-80">
            <img 
              src="/desain_logo.png" 
              alt="VBTix Logo" 
              className="h-24 w-auto object-contain scale-175"
            />
          </Link>

          {/* Navigation */}
          <NavigationMenu className="hidden md:block">
            <NavigationMenuList className="flex space-x-8">
              <NavigationMenuItem>
                <Link href="/events" className={navLinkClasses}>
                  Jelajah Event
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/buyer/about" className={navLinkClasses}>
                  Tentang Kami
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right side: Theme selector, cart, notifications, user */}
          <div className="flex items-center space-x-4">
            <ThemeSelector variant="ghost" size="sm" />

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-white hover:bg-white/20 transition-all duration-300 interactive-scale"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full text-white hover:bg-white/20 transition-all duration-300 interactive-scale relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></span>
              <span className="sr-only">Notifications</span>
            </Button>            {/* User Dropdown or Login Button */}
            {mounted && session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 gap-2 px-3 text-white hover:bg-white/10 transition-colors duration-200">
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={session.user.image ?? ""}
                        alt={session.user.name ?? "User"}
                      />
                      <AvatarFallback className="bg-white/20 text-white text-xs">
                        {session.user.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline-block text-sm">
                      {session.user.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/buyer/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/buyer/tickets">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>Tiket Saya</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Keluar</span>                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : mounted ? (
              <Link href="/login">
                <Button variant="secondary" size="sm" className="h-9 bg-white/10 text-white hover:bg-white/20 border-white/20">
                  <User className="mr-2 h-4 w-4" />
                  <span>Masuk</span>
                </Button>
              </Link>
            ) : (
              <div className="h-9 w-20"></div>
            )}
          </div>
        </div>        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden">
          <Link href="/buyer" className="flex items-center transition-opacity hover:opacity-80">
            <img 
              src="/desain_logo.png" 
              alt="VBTix Logo" 
              className="h-18 w-auto object-contain scale-175"
            />
          </Link>

          {/* Mobile Menu and Search */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className={searchBtnClasses}
              onClick={toggleSearch}
              size="icon"
            >
              <Search size={18} />
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" className={searchBtnClasses} size="icon">
                  <Menu size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-gradient-brand text-white border-none">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>
                    Mobile navigation menu for VBTicket
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-8 space-y-6">
                  <nav className="flex flex-col gap-4">
                    <Link href="/events" className={mobileNavLinkClasses}>
                      Jelajah Event
                    </Link>
                    <Link href="/buyer/about" className={mobileNavLinkClasses}>
                      Tentang Kami
                    </Link>
                  </nav>                  {/* Mobile User Section */}
                  <div className="border-t border-white/20 pt-6">
                    {mounted && session?.user ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={session.user.image ?? ""}
                              alt={session.user.name ?? "User"}
                            />
                            <AvatarFallback className="bg-white/20 text-white text-sm">
                              {session.user.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") ?? "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-white font-medium">
                            {session.user.name}
                          </span>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Link href="/buyer/profile" className={mobileNavLinkClasses}>
                            Profil
                          </Link>
                          <Link href="/buyer/tickets" className={mobileNavLinkClasses}>
                            Tiket Saya
                          </Link>
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className={mobileNavLinkClasses}
                          >
                            Keluar
                          </button>
                        </div>                      </div>
                    ) : mounted ? (
                      <Link href="/login">
                        <Button variant="secondary" className="w-full bg-white/10 text-white hover:bg-white/20 border-white/20">
                          <User className="mr-2 h-4 w-4" />
                          <span>Masuk</span>
                        </Button>
                      </Link>
                    ) : (
                      <div className="w-full h-10"></div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
