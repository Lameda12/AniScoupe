"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Tv2, Search, Compass, Bookmark } from "lucide-react";
import { getWatchlistCount } from "@/lib/watchlist";

const links = [
  { href: "/", label: "Home", icon: Tv2 },
  { href: "/search", label: "Search", icon: Search },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/watchlist", label: "Watchlist", icon: Bookmark },
];

export default function Navbar() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => setCount(getWatchlistCount());
    update();
    window.addEventListener("storage", update);
    window.addEventListener("watchlist-updated", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("watchlist-updated", update);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-2xl text-white tracking-wider">
              ANI<span className="text-indigo-500">SCOPE</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}>
                  <Button
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                    className={`gap-2 ${active ? "text-white" : "text-muted-foreground hover:text-white"}`}
                  >
                    <Icon size={16} />
                    {label}
                    {label === "Watchlist" && count > 0 && (
                      <Badge className="bg-rose-500 text-white text-xs h-5 min-w-5 flex items-center justify-center rounded-full px-1">
                        {count}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger render={<Button variant="ghost" size="icon" />}>
                <Menu size={20} />
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-border w-64">
                <div className="flex flex-col gap-2 mt-8">
                  {links.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                      <Link key={href} href={href} onClick={() => setOpen(false)}>
                        <Button
                          variant={active ? "secondary" : "ghost"}
                          className={`w-full justify-start gap-3 ${active ? "text-white" : "text-muted-foreground"}`}
                        >
                          <Icon size={18} />
                          {label}
                          {label === "Watchlist" && count > 0 && (
                            <Badge className="bg-rose-500 text-white text-xs ml-auto">
                              {count}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
