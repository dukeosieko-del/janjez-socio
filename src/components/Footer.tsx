import Link from "next/link";
import { FOOTER_LINKS } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="bg-kenya-black border-t border-kenya-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-kenya-green rounded-lg flex items-center justify-center">
                <span className="text-kenya-black font-bold text-lg">J</span>
              </div>
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
                href="https://wa.me/254101574056"
                className="w-10 h-10 rounded-full bg-kenya-white/5 flex items-center justify-center text-kenya-white/70 hover:bg-kenya-green hover:text-kenya-black transition-colors"
                aria-label="WhatsApp Channel"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/254101574056"
                className="w-10 h-10 rounded-full bg-kenya-white/5 flex items-center justify-center text-kenya-white/70 hover:bg-kenya-green hover:text-kenya-black transition-colors"
                aria-label="Talk to Us"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488a11.842 11.842 0 013.683 8.381c-.003 6.556-5.338 11.892-11.893 11.892-1.631 0-3.197-.296-4.605-.824L.057 24zM6.56 21.305l.295.168c5.176 2.967 11.519-1.368 10.353-6.644-1.166-5.276-6.842-8.393-12.018-7.223-5.176 1.169-8.38 6.418-7.211 11.694 1.17 5.276 6.553 8.393 11.581 7.223zM17.868 6.455c-.779-.388-1.296-.64-1.553-.866-.256-.225-.01-.528.178-.793.188-.264.421-.639.636-.866.215-.227.307-.38.431-.627.124-.247.065-.612-.052-.907-.117-.295-.546-.619-.858-.792-.312-.173-.728-.256-1.166-.208-.439.048-1.09.205-1.785.878-.695.674-1.087 1.652-1.087 2.619 0 .967.392 1.945 1.087 2.619.695.674 1.346.83 1.785.878.438.048.854-.035 1.166-.208.312-.173.741-.497.858-.792.117-.295.176-.66.052-.907-.124-.247-.216-.4-.431-.627-.215-.227-.448-.602-.636-.866-.188-.265-.434-.568-.178-.793.257-.226.774-.478 1.553-.866 1.137-.567 2.151-.868 2.776-.868.625 0 1.368.301 2.776.868.778.388 1.295.64 1.552.866.256.225.01.528-.177.793-.188.264-.422.639-.637.866-.215.227-.307.38-.431.627-.124.247-.065.612.052.907.117.295.546.619.858.792.312.173.728.256 1.166.208.439-.048 1.09-.205 1.785-.878.695-.674 1.087-1.652 1.087-2.619 0-.967-.392-1.945-1.087-2.619-.695-.674-1.346-.83-1.785-.878-.438-.048-.854.035-1.166.208-.312.173-.741.497-.858.792-.117.295-.176.66-.052.907.124.247.216.4.431.627.215.227.448.602.636.866.188.265.434.568.178.793-.257.226-.774.478-1.553.866-1.137.567-2.151.868-2.776.868-.625 0-1.368-.301-2.776-.868z"/>
                </svg>
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
