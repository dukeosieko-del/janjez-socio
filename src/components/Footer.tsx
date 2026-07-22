import Link from "next/link";
import Image from "next/image";
import { FOOTER_LINKS } from "@/lib/data";

export default function Footer() {
  const whatsappIcon = (
    <Image src="/whatsapp-icon.png" alt="WhatsApp" width={20} height={20} className="w-5 h-5 object-contain" />
  );
  const facebookIcon = (
    <Image src="/facebook-icon.png" alt="Facebook" width={20} height={20} className="w-5 h-5 object-contain" />
  );
  const googleReviewsIcon = (
    <Image src="/google-reviews-icon.png" alt="Google Reviews" width={20} height={20} className="w-5 h-5 object-contain" />
  );

  return (
    <footer className="bg-kenya-black border-t border-kenya-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image src="/janjez-logo.png" alt="janjez.social" width={32} height={32} className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-kenya-white">
                janjez<span className="text-kenya-green">.social</span>
              </span>
            </Link>
            <p className="text-kenya-white/50 text-sm mb-6">
              Kenya&apos;s plug for instant social clout. Pata clout chapchap —
              Lipa na M-Pesa.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://www.google.com/search?q=janjez.social"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-kenya-white/5 flex items-center justify-center text-kenya-white/70 hover:bg-red-500 hover:text-white transition-colors"
                aria-label="Google Reviews"
              >
                {googleReviewsIcon}
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61592028091844"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-kenya-white/5 flex items-center justify-center text-kenya-white/70 hover:bg-blue-600 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                {facebookIcon}
              </a>
              <a
                href="https://wa.me/254101574056"
                className="w-10 h-10 rounded-full bg-kenya-white/5 flex items-center justify-center text-kenya-white/70 hover:bg-kenya-green hover:text-kenya-black transition-colors"
                aria-label="WhatsApp Channel"
              >
                {whatsappIcon}
              </a>
              <a
                href="https://wa.me/254101574056"
                className="w-10 h-10 rounded-full bg-kenya-white/5 flex items-center justify-center text-kenya-white/70 hover:bg-kenya-green hover:text-kenya-black transition-colors"
                aria-label="Talk to Us"
              >
                {whatsappIcon}
              </a>
            </div>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-kenya-white font-semibold text-sm uppercase tracking-wider mb-4">
              Information & Resources
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.information.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-kenya-white/50 hover:text-kenya-green text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-kenya-white font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Actions
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.quickActions.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-kenya-white/50 hover:text-kenya-green text-sm transition-colors flex items-center gap-2"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h3 className="text-kenya-white font-semibold text-sm uppercase tracking-wider mb-4">
              Support & Legal
            </h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-kenya-white/50 hover:text-kenya-green text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-kenya-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-kenya-white/30 text-sm">
            &copy; {new Date().getFullYear()} janjez.social. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-kenya-white/30">Proudly Kenyan 🇰🇪</span>
            <span className="text-kenya-green text-xs">●</span>
            <span className="text-xs text-kenya-white/30">Lipa na M-Pesa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
