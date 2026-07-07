import Link from "next/link";
import Image from "next/image";
import { Globe, Mail, MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-slate text-cream-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Image src="/logo.jpg" alt="JobzMitra Logo" width={32} height={32} className="rounded-xl object-cover" />
              <span className="font-headings font-bold text-2xl tracking-tight text-white">
                JobzMitra
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              The "Instagram for Careers" — discovering opportunities, learning skills, and building professional networks.
            </p>
            <div className="flex items-center gap-4 text-white/60">
              <Link href="#" className="hover:text-white transition-colors"><Globe size={20} /></Link>
              <Link href="#" className="hover:text-white transition-colors"><MessageSquare size={20} /></Link>
              <Link href="#" className="hover:text-white transition-colors"><Mail size={20} /></Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 font-headings text-lg">Platform</h4>
            <ul className="flex flex-col gap-4 text-sm text-white/60">
              <li><Link href="#" className="hover:text-terracotta transition-colors">Career Feed</Link></li>
              <li><Link href="#" className="hover:text-terracotta transition-colors">Job Search</Link></li>
              <li><Link href="#" className="hover:text-terracotta transition-colors">Career Reels</Link></li>
              <li><Link href="#" className="hover:text-terracotta transition-colors">Communities</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 font-headings text-lg">For Companies</h4>
            <ul className="flex flex-col gap-4 text-sm text-white/60">
              <li><Link href="#" className="hover:text-terracotta transition-colors">Post a Job</Link></li>
              <li><Link href="#" className="hover:text-terracotta transition-colors">Recruiter Dashboard</Link></li>
              <li><Link href="#" className="hover:text-terracotta transition-colors">Employer Branding</Link></li>
              <li><Link href="#" className="hover:text-terracotta transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 font-headings text-lg">Company</h4>
            <ul className="flex flex-col gap-4 text-sm text-white/60">
              <li><Link href="#" className="hover:text-terracotta transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-terracotta transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-terracotta transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-terracotta transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>© 2026 Aevonic Technologies. All rights reserved.</p>
          <p>Made with ❤️ in India</p>
        </div>
      </div>
    </footer>
  );
}
