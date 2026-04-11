import Link from "next/link";
import { Ghost, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Navbar showBack backHref="/" backLabel="Home" />
      
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        {/* Decorative background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] -z-10 pointer-events-none" />

        <div className="max-w-xl w-full text-center space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-10 duration-700">
        
        {/* Animated Ghost Icon */}
        <div className="mx-auto w-32 h-32 relative mb-8 group">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="w-full h-full bg-card border border-border shadow-2xl rounded-3xl flex items-center justify-center rotate-3 group-hover:-rotate-3 transition-transform duration-500">
            <Ghost className="h-14 w-14 text-primary animate-bounce mix-blend-difference" />
          </div>
          {/* Floating badge */}
          <div className="absolute -top-3 -right-3 rotate-12 bg-destructive text-destructive-foreground text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-lg">
            404 Error
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
            Oops! Dead End.
          </h1>
          <p className="text-xl text-muted-foreground font-semibold leading-relaxed max-w-md mx-auto">
            Looks like this page doesn't exist. Just like an entry-level job requiring 10 years of experience.
          </p>
        </div>

        {/* Mock search bar for aesthetic */}
        <div className="relative max-w-sm mx-auto my-8 opacity-60 grayscale cursor-not-allowed">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input 
            disabled
            type="text" 
            className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm font-medium focus:outline-none"
            placeholder="Search for a Junior Dev role with 5 yrs React..." 
            aria-label="Joke search input"
          />
        </div>

        <div className="flex justify-center pt-2">
          <Button render={<Link href="/" />} size="lg" className="h-14 px-8 font-black text-base shadow-xl hover:shadow-primary/25 transition-all">
            <Home className="mr-2 h-5 w-5" />
            Take Me Back Home
          </Button>
        </div>
        </div>
      </div>
    </div>
  );
}
