import Link from "next/link";
import Image from "next/image";
import { FOOTER_LINKS } from "@/lib/data";
import { EMAIL_DEPARTMENTS, SUPPORT_ADDRESS, SUPPORT_PHONE, SUPPORT_WHATSAPP } from "@/lib/email/config";

function isInternal(href: string) {
  return href.startsWith("/");
}

export default function Footer() {
  const whatsappIcon = (
    <Image src="/whatsapp-icon.png" alt="WhatsApp" width={24} height={24} className="w-6 h-6 object-contain" />
  );
  const facebookIcon = (
    <Image src="/facebook-icon.png" alt="Facebook" width={24} height={24} className="w-6 h-6 object-contain" />
  );
  const googleReviewsIcon = (
    <Image src="/google-reviews-icon.png" alt="Google Reviews" width={24} height={24} className="w-6 h-6 object-contain" />
  );

  return (
    <footer className="bg-kenya-black border-t border-kenya-white/10" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
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
            <div className="flex items-center gap-3">
              <a
                href="https://www.google.com/search?q=janjez.social"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-kenya-white/5 flex items-center justify-center text-kenya-white/70 hover:bg-red-500 hover:text-white transition-colors"
                aria-label="Google Reviews"
              >
                {googleReviewsIcon}
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61592028091844"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-kenya-white/5 flex items-center justify-center text-kenya-white/70 hover:bg-blue-600 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                {facebookIcon}
              </a>
              <a
                href={SUPPORT_WHATSAPP}
                className="w-11 h-11 rounded-full bg-kenya-white/5 flex items-center justify-center text-kenya-white/70 hover:bg-kenya-green hover:text-kenya-black transition-colors"
                aria-label="WhatsApp"
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
                  {isInternal(link.href) ? (
                    <Link
                      href={link.href}
                      className="text-kenya-white/50 hover:text-kenya-green text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-kenya-white/50 hover:text-kenya-green text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
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
                  {isInternal(link.href) ? (
                    <Link
                      href={link.href}
                      className="text-kenya-white/50 hover:text-kenya-green text-sm transition-colors flex items-center gap-2"
                      >
                      {link.icon && (
                        <Image src={link.icon} alt={link.label} width={20} height={20} className="w-5 h-5 object-contain" />
                      )}
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-kenya-white/50 hover:text-kenya-green text-sm transition-colors flex items-center gap-2"
                    >
                      {link.icon && (
                        <Image src={link.icon} alt={link.label} width={20} height={20} className="w-5 h-5 object-contain" />
                      )}
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Email */}
          <div>
            <h3 className="text-kenya-white font-semibold text-sm uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm">
              {EMAIL_DEPARTMENTS.map((dept) => (
                <li key={dept.address}>
                  <span className="text-kenya-white/70 block">{dept.label}</span>
                  <a href={`mailto:${dept.address}`} className="text-kenya-green hover:underline">{dept.address}</a>
                  <span className="text-kenya-white/40 text-xs block">{dept.description}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-1 text-sm">
              <p>
                <span className="text-kenya-white/70">Phone:</span>{" "}
                <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`} className="text-kenya-green hover:underline">{SUPPORT_PHONE}</a>
              </p>
              <p>
                <span className="text-kenya-white/70">WhatsApp:</span>{" "}
                <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer" className="text-kenya-green hover:underline">Chat now</a>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 sm:mt-16 pt-6 sm:pt-8 border-t border-kenya-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
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
