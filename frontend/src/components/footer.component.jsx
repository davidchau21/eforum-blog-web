import { Link } from "react-router-dom";
import { useContext } from "react";
import logoDark from "../imgs/logo-dark.png";
import logoLight from "../imgs/logo-light.png";
import { UserContext, ThemeContext } from "../App";
import { getTranslations } from "../../translations";

/* ─── Paper Design System Footer ─────────────────────────────────────────────
   Tokens:
     primary   = #111111    (headings, logo text, icon fills)
     text-muted= #6B7280    (body copy, nav links)
     border    = #E5E7EB    (dividers — 1 px, never thicker)
     surface   = #FAFAFA    (footer background — off-white "paper")
     surface-d = #18181B    (dark mode)
     accent    = #8B5CF6    (hover state — secondary token)
   Typography:
     display  = Montserrat (logo, section headings — font-[Montserrat])
     body     = Roboto     (nav links, body copy — font-[Roboto])
   Spacing rhythm: 4 / 8 / 12 / 16 / 24 / 32 px
──────────────────────────────────────────────────────────────────────────── */

const NavLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="
        font-[Roboto] text-[13px] font-normal text-[#6B7280]
        hover:text-[#8B5CF6] focus-visible:text-[#8B5CF6]
        transition-colors duration-150
        focus-visible:outline-none focus-visible:underline
        underline-offset-2
      "
    >
      {children}
    </Link>
  </li>
);

const SectionHeading = ({ children }) => (
  <h4
    className="
      font-[Montserrat] text-[10px] font-[700] tracking-[0.14em]
      uppercase text-[#111111] dark:text-[#F9FAFB] mb-4
    "
  >
    {children}
  </h4>
);

const SocialBtn = ({ to, label, icon }) => (
  <a
    href={to}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="
      w-8 h-8 flex items-center justify-center
      border border-[#E5E7EB] dark:border-[#3F3F46]
      text-[#6B7280] dark:text-[#9CA3AF]
      hover:border-[#8B5CF6] hover:text-[#8B5CF6]
      focus-visible:border-[#8B5CF6] focus-visible:text-[#8B5CF6]
      focus-visible:outline-none
      transition-all duration-150
      rounded-sm
    "
  >
    <i className={`fi ${icon} text-xs leading-none`}></i>
  </a>
);

const Footer = () => {
  const { userAuth } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);
  const { language } = userAuth;
  const translations = getTranslations(language);

  return (
    <footer
      role="contentinfo"
      className={`
        border-t border-[#E5E7EB] dark:border-[#27272A]
        ${theme === "light" ? "bg-[#FAFAFA]" : "bg-[#18181B]"}
        transition-colors duration-300
      `}
    >
      {/* ── Main grid ── */}
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-12 lg:gap-24">

        {/* Brand block */}
        <div className="max-w-xs space-y-5">
          <Link
            to="/"
            aria-label={`${translations.siteName || "EFORUM"} — home`}
            className="inline-flex items-center gap-2.5 group focus-visible:outline-none"
          >
            <img
              src={theme === "light" ? logoDark : logoLight}
              className="h-8 w-auto object-contain"
              alt=""
              aria-hidden="true"
            />
            <span
              className="
                font-[Montserrat] font-[800] text-[15px] tracking-tight
                text-[#111111] dark:text-[#F9FAFB] uppercase
                group-hover:text-[#8B5CF6] transition-colors duration-150
              "
            >
              {translations.siteName || "EFORUM"}
            </span>
          </Link>

          <p className="font-[Roboto] text-[13px] font-normal text-[#6B7280] leading-[1.6]">
            {translations.aboutUsDes ||
              "Nền tảng chia sẻ tri thức và thảo luận hàng đầu dành cho cộng đồng học thuật trẻ."}
          </p>

          {/* Social icons */}
          <div className="flex gap-2 pt-1">
            <SocialBtn to="https://www.facebook.com/" label="Facebook" icon="fi-brands-facebook" />
            <SocialBtn to="https://twitter.com/" label="Twitter / X" icon="fi-brands-twitter" />
            <SocialBtn to="https://www.youtube.com/" label="YouTube" icon="fi-brands-youtube" />
            <SocialBtn to="https://github.com/davidchau21/edu-blog-web" label="GitHub" icon="fi-brands-github" />
          </div>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Explore */}
          <nav aria-label="Explore navigation">
            <SectionHeading>{translations.navigation || "Explore"}</SectionHeading>
            <ul className="space-y-3">
              <NavLink to="/feed">Latest Feed</NavLink>
              <NavLink to="/trending">Trending</NavLink>
              <NavLink to="/chat">Community</NavLink>
            </ul>
          </nav>

          {/* Company */}
          <nav aria-label="Company navigation">
            <SectionHeading>{translations.aboutUs || "Company"}</SectionHeading>
            <ul className="space-y-3">
              <NavLink to="/about">{translations.aboutUs || "About"}</NavLink>
              <NavLink to="/contact">{translations.contact || "Contact"}</NavLink>
            </ul>
          </nav>

          {/* Legal */}
          <nav aria-label="Legal navigation">
            <SectionHeading>{translations.legal || "Legal"}</SectionHeading>
            <ul className="space-y-3">
              <NavLink to="/privacy">{translations.privacy || "Privacy"}</NavLink>
              <NavLink to="/terms-of-service">{translations.termsOfService || "Terms"}</NavLink>
              <NavLink to="/policy">{translations.policy || "Policy"}</NavLink>
            </ul>
          </nav>

          {/* Account */}
          <nav aria-label="Account navigation">
            <SectionHeading>Account</SectionHeading>
            <ul className="space-y-3">
              <NavLink to="/signin">Sign In</NavLink>
              <NavLink to="/signup">Sign Up</NavLink>
              <NavLink to="/settings/edit-profile">Profile</NavLink>
            </ul>
          </nav>

        </div>
      </div>

      {/* ── Bottom strip ── */}
      <div className="border-t border-[#E5E7EB] dark:border-[#27272A]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="font-[Roboto] text-[11px] text-[#9CA3AF] tracking-[0.08em]">
            © 2025 {translations.siteName || "EFORUM"}. All rights reserved.
          </p>
          <p className="font-[Roboto] text-[11px] text-[#9CA3AF] tracking-[0.08em]">
            Made with ✨ for learners
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
