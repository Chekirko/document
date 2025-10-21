import React from "react";
import {
  FacebookIcon,
  YoutubeIcon,
  ViberIcon,
  TelegramIcon,
  RssIcon,
} from "./Icons";

interface SocialLinksProps {
  bgColor?: string;
  iconColor?: string;
}

const socialData = [
  {
    href: "https://www.facebook.com/boryslavrada/?locale=uk_UA",
    label: "Facebook",
    Icon: FacebookIcon,
  },
  {
    href: "https://www.youtube.com/@boryslavrada",
    label: "YouTube",
    Icon: YoutubeIcon,
  },
  { href: "/", label: "Viber", Icon: ViberIcon },
  {
    href: "https://t.me/boryslavrada",
    label: "Telegram",
    Icon: TelegramIcon,
  },
  {
    href: "/",
    label: "RSS Feed",
    Icon: RssIcon,
  },
];

const SocialLinks: React.FC<SocialLinksProps> = ({
  bgColor = "bg-transparent",
  iconColor = "text-white",
}) => {
  const iconBaseClasses = `w-9 h-9 transition-colors duration-200`;

  // linkClasses включає клас кольору, наприклад: 'text-white'
  const linkClasses = `flex-shrink-0 ${iconColor} hover:text-blue-400`;

  const containerClasses = `p-2 ${bgColor} flex space-x-4 items-center justify-center`;

  return (
    <div className={containerClasses}>
      {socialData.map(({ href, label, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={linkClasses}
        >
          <Icon
            // Тільки className передається іконці.
            // Клас кольору успадковується від батьківського <a>.
            className={iconBaseClasses}
          />
        </a>
      ))}
    </div>
  );
};

export default SocialLinks;
