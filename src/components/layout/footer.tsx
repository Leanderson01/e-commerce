import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const topLinks = [
  { name: "CONTACT", href: "/contact" },
  { name: "TERMS OF SERVICES", href: "/terms" },
  { name: "SHIPPING AND RETURNS", href: "/shipping" },
];

const socialLinks = [
  { name: "Facebook", href: "#", src: "/icons/face.png" },
  { name: "Instagram", href: "#", src: "/icons/insta.png" },
  { name: "Twitter", href: "#", src: "/icons/x.png" },
  { name: "LinkedIn", href: "#", src: "/icons/mail.png" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t">
      <div className="mx-auto px-24 py-8">
        {/* Top Section */}
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          {/* Left - Navigation Links */}
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-8">
            {topLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right - Newsletter */}
          <div className="mb-3 flex w-full max-w-md items-center space-x-2 md:w-auto md:min-w-[350px]">
            <input
              type="email"
              placeholder="Give an email, get the newsletter."
              className="border-muted-foreground placeholder:text-muted-foreground focus:border-foreground flex h-9 w-full rounded-none border-0 border-b bg-transparent px-0 py-1 text-sm focus:ring-0 focus:outline-none"
            />
            <button className="text-muted-foreground hover:text-foreground flex-shrink-0 transition-colors">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 flex flex-col items-start justify-between space-y-4 pt-8 md:flex-row md:space-y-0">
          {/* Left - Copyright */}
          <div className="text-muted-foreground flex space-x-2 text-sm">
            <span>© {currentYear}</span>
            <Link
              href="/terms"
              className="hover:text-foreground underline transition-colors"
            >
              Terms of use
            </Link>
            <span>and</span>
            <Link
              href="/privacy"
              className="hover:text-foreground underline transition-colors"
            >
              privacy policy.
            </Link>
          </div>

          {/* Right - Social Icons (commented for now) */}
          <div className="flex space-x-4">
            {socialLinks.map((social) => (
              <Link
                key={social.name}
                href={social.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label={social.name}
              >
                <Image
                  src={social.src}
                  alt={social.name}
                  width={16}
                  height={16}
                  className="h-4 w-4 object-contain"
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
