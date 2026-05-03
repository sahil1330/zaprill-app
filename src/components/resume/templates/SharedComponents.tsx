"use client";

import {
  IconBrandBehance,
  IconBrandDribbble,
  IconBrandFacebook,
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandStackoverflow,
  IconBrandTwitter,
  IconBrandX,
  IconBrandYoutube,
  IconGlobe,
  IconMail,
  IconMapPin,
  IconPhone,
  IconWorld,
} from "@tabler/icons-react";
import React from "react";

/**
 * Maps a profile network name to a Tabler icon.
 */
export const getProfileIcon = (network: string) => {
  const net = (network || "").toLowerCase();
  if (net.includes("github")) return IconBrandGithub;
  if (net.includes("linkedin")) return IconBrandLinkedin;
  if (net.includes("twitter")) return IconBrandTwitter;
  if (net.includes("x.com")) return IconBrandX;
  if (net.includes("facebook")) return IconBrandFacebook;
  if (net.includes("instagram")) return IconBrandInstagram;
  if (net.includes("youtube")) return IconBrandYoutube;
  if (net.includes("behance")) return IconBrandBehance;
  if (net.includes("dribbble")) return IconBrandDribbble;
  if (net.includes("stackoverflow")) return IconBrandStackoverflow;
  return IconWorld;
};

/**
 * Formats a profile URL for display by removing protocols and trailing slashes.
 */
export const formatProfileText = (url: string, fallback: string) => {
  if (!url) return fallback;
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
};

// Re-export common icons from Tabler to unify the library across templates
export { IconMail, IconPhone, IconMapPin, IconWorld, IconGlobe };

interface ContactItemProps {
  icon: any;
  text: string;
  href?: string;
  className?: string;
}

/**
 * A standard contact item with an icon and optional link.
 */
export function ContactItem({
  icon: Icon,
  text,
  href,
  className = "",
}: ContactItemProps) {
  if (!text) return null;

  const content = (
    <span className={`contact-item ${className}`}>
      <Icon className="contact-icon" />
      <span className="contact-text">{text}</span>
    </span>
  );

  if (href) {
    // Ensure URL has protocol
    const fullHref =
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
        ? href
        : `https://${href}`;

    return (
      <a
        href={fullHref}
        target="_blank"
        rel="noopener noreferrer"
        className="contact-link"
      >
        {content}
      </a>
    );
  }

  return content;
}
