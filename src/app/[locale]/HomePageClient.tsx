"use client";

import { useState, Suspense, lazy } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ExternalLink,
  Lightbulb,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
// import { SidebarAd } from "@/components/ads/SidebarAd";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";
import type { ModuleLinkMap } from "@/lib/buildModuleLinkMap";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// Conditionally render text as a link or plain span
function LinkedTitle({
  linkData,
  children,
  className,
  locale,
}: {
  linkData: { url: string; title: string } | null | undefined;
  children: React.ReactNode;
  className?: string;
  locale: string;
}) {
  if (linkData) {
    const href = locale === "en" ? linkData.url : `/${locale}${linkData.url}`;
    return (
      <Link
        href={href}
        className={`${className || ""} hover:text-[hsl(var(--nav-theme-light))] hover:underline decoration-[hsl(var(--nav-theme-light))/0.4] underline-offset-4 transition-colors`}
        title={linkData.title}
      >
        {children}
      </Link>
    );
  }
  return <>{children}</>;
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  moduleLinkMap: ModuleLinkMap;
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  moduleLinkMap,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.world-of-nukes.wiki";

  // Structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "World of Nukes Wiki",
        description:
          "World of Nukes Wiki covering missiles, defense, buildings, jets, warships, wonders, and beginner guides for the Roblox nuclear warfare strategy tycoon.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1600,
          height: 900,
          caption: "World of Nukes - Roblox Nuclear Warfare Strategy Tycoon",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "World of Nukes Wiki",
        alternateName: "World of Nukes",
        url: siteUrl,
        description:
          "World of Nukes Wiki resource hub for missile guides, base building, defense strategies, jets, warships, wonders, and beginner tips",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1600,
          height: 900,
          caption: "World of Nukes Wiki - Roblox Nuclear Warfare Strategy Tycoon",
        },
        sameAs: [
          "https://www.roblox.com/games/139707731553337/World-of-Nukes",
          "https://www.roblox.com/groups/957612245/Build-Defend-Nuke",
        ],
      },
      {
        "@type": "VideoGame",
        name: "World of Nukes",
        gamePlatform: ["PC", "Xbox", "PlayStation", "Mobile"],
        applicationCategory: "Game",
        genre: ["Strategy", "Tycoon", "PvP", "Military"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 7,
        },
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/games/139707731553337/World-of-Nukes",
        },
      },
      {
        "@type": "VideoObject",
        name: "World of Nukes / Gameplay / #roblox",
        description:
          "World of Nukes gameplay video featuring island building, missile launches, and nuclear warfare preview.",
        uploadDate: "2026-10-29",
        thumbnailUrl: "https://i.ytimg.com/vi/g9OvQ0MHpMs/hqdefault.jpg",
        embedUrl: "https://www.youtube.com/embed/g9OvQ0MHpMs",
        url: "https://www.youtube.com/watch?v=g9OvQ0MHpMs",
      },
    ],
  };

  // FAQ accordion states
  const [faqExpanded, setFaqExpanded] = useState<number | null>(null);
  const [wonderExpanded, setWonderExpanded] = useState<number | null>(0);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  // Tools Grid 卡片对应的 section 锚点（与下文 8 个模块一一对应）
  const toolSectionIds = [
    "codes-rewards",
    "beginner-guide",
    "best-nukes-missiles",
    "best-defense",
    "island-building",
    "jets-warships",
    "wonders-doomsday",
    "updates-gamepasses",
  ];

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 左侧广告容器 - Fixed 定位 */}
      {/* <aside
        className="hidden xl:block fixed top-20 w-40 z-10"
        style={{ left: "calc((100vw - 896px) / 2 - 180px)" }}
      >
        <SidebarAd
          type="sidebar-160x300"
          adKey={process.env.NEXT_PUBLIC_AD_SIDEBAR_160X300}
        />
      </aside> */}

      {/* 右侧广告容器 - Fixed 定位 */}
      {/* <aside
        className="hidden xl:block fixed top-20 w-40 z-10"
        style={{ right: "calc((100vw - 896px) / 2 - 180px)" }}
      >
        <SidebarAd
          type="sidebar-160x600"
          adKey={process.env.NEXT_PUBLIC_AD_SIDEBAR_160X600}
        />
      </aside> */}

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("beginner-guide")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/games/139707731553337/World-of-Nukes"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* Video Section */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="g9OvQ0MHpMs"
              title="World of Nukes / Gameplay / #roblox"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = toolSectionIds[index];

              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Updates Section（紧跟 Tools Grid） */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: Codes and Free Rewards */}
      <section id="codes-rewards" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["worldOfNukesCodes"]}
                locale={locale}
              >
                {t.modules.worldOfNukesCodes.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg font-medium text-[hsl(var(--nav-theme-light))] max-w-3xl mx-auto mb-4">
              {t.modules.worldOfNukesCodes.subtitle}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.worldOfNukesCodes.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.worldOfNukesCodes.items.map(
              (item: any, index: number) => (
                <div
                  key={index}
                  className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                      <DynamicIcon
                        name={item.icon}
                        className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                      />
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">
                    <LinkedTitle
                      linkData={
                        moduleLinkMap[`worldOfNukesCodes::items::${index}`]
                      }
                      locale={locale}
                    >
                      {item.title}
                    </LinkedTitle>
                  </h3>
                  {item.description && (
                    <p className="text-muted-foreground text-sm">
                      {item.description}
                    </p>
                  )}
                  {item.steps && (
                    <ol className="space-y-2 mt-1">
                      {item.steps.map((step: string, si: number) => (
                        <li
                          key={si}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="flex h-5 w-5 mt-0.5 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--nav-theme)/0.2)] text-[10px] font-bold text-[hsl(var(--nav-theme-light))]">
                            {si + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Beginner Guide */}
      <section
        id="beginner-guide"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["worldOfNukesBeginnerGuide"]}
                locale={locale}
              >
                {t.modules.worldOfNukesBeginnerGuide.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg font-medium text-[hsl(var(--nav-theme-light))] max-w-3xl mx-auto mb-4">
              {t.modules.worldOfNukesBeginnerGuide.subtitle}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.worldOfNukesBeginnerGuide.intro}
            </p>
          </div>

          {/* Steps */}
          <div className="scroll-reveal space-y-4 md:space-y-6 mb-8 md:mb-10">
            {t.modules.worldOfNukesBeginnerGuide.steps.map(
              (step: any, index: number) => (
                <div
                  key={index}
                  className="p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                      <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                        {index + 1}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg md:text-xl font-bold mb-1">
                        <LinkedTitle
                          linkData={
                            moduleLinkMap[
                              `worldOfNukesBeginnerGuide::steps::${index}`
                            ]
                          }
                          locale={locale}
                        >
                          {step.title}
                        </LinkedTitle>
                      </h3>
                      <p className="text-sm font-medium text-[hsl(var(--nav-theme-light))] mb-2">
                        {step.objective}
                      </p>
                      <ul className="space-y-1.5">
                        {step.actions.map((action: string, ai: number) => (
                          <li
                            key={ai}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                            {action}
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 text-sm text-muted-foreground border-l-2 border-[hsl(var(--nav-theme)/0.4)] pl-3">
                        {step.priority}
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          {/* Quick Tips */}
          <div className="scroll-reveal p-4 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Lightbulb className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-base md:text-lg">Quick Tips</h3>
            </div>
            <ul className="space-y-2">
              {t.modules.worldOfNukesBeginnerGuide.quickTips.map(
                (tip: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{tip}</span>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Module 3: Best Nukes & Missiles */}
      <section
        id="best-nukes-missiles"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["worldOfNukesBestNukesMissiles"]}
                locale={locale}
              >
                {t.modules.worldOfNukesBestNukesMissiles.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg font-medium text-[hsl(var(--nav-theme-light))] max-w-3xl mx-auto mb-4">
              {t.modules.worldOfNukesBestNukesMissiles.subtitle}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.worldOfNukesBestNukesMissiles.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.worldOfNukesBestNukesMissiles.tiers.map(
              (tier: any, index: number) => (
                <div
                  key={index}
                  className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                      <DynamicIcon
                        name={tier.icon}
                        className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                      />
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] font-semibold text-[hsl(var(--nav-theme-light))]">
                      {tier.tier}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">
                    <LinkedTitle
                      linkData={
                        moduleLinkMap[
                          `worldOfNukesBestNukesMissiles::tiers::${index}`
                        ]
                      }
                      locale={locale}
                    >
                      {tier.title}
                    </LinkedTitle>
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
                    {tier.category}
                  </p>
                  <ul className="space-y-1.5 mb-4">
                    {tier.stats.map((stat: string, si: number) => (
                      <li
                        key={si}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                        {stat}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Unlock:{" "}
                      </span>
                      {tier.unlock}
                    </p>
                    <p className="text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        Strategy:{" "}
                      </span>
                      {tier.strategy}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 4: Best Defense Strategy */}
      <section
        id="best-defense"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["worldOfNukesBestDefenseStrategy"]}
                locale={locale}
              >
                {t.modules.worldOfNukesBestDefenseStrategy.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg font-medium text-[hsl(var(--nav-theme-light))] max-w-3xl mx-auto mb-4">
              {t.modules.worldOfNukesBestDefenseStrategy.subtitle}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.worldOfNukesBestDefenseStrategy.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.worldOfNukesBestDefenseStrategy.options.map(
              (option: any, index: number) => (
                <div
                  key={index}
                  className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                      <DynamicIcon
                        name={option.icon}
                        className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">
                        <LinkedTitle
                          linkData={
                            moduleLinkMap[
                              `worldOfNukesBestDefenseStrategy::options::${index}`
                            ]
                          }
                          locale={locale}
                        >
                          {option.title}
                        </LinkedTitle>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {option.role}
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-1.5 mb-4">
                    {option.strengths.map((s: string, si: number) => (
                      <li
                        key={si}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto p-3 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-lg">
                    <p className="text-xs font-semibold text-[hsl(var(--nav-theme-light))] mb-1">
                      Placement
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {option.placement}
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 5: Island Building & Upgrades */}
      <section
        id="island-building"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["worldOfNukesIslandBuilding"]}
                locale={locale}
              >
                {t.modules.worldOfNukesIslandBuilding.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg font-medium text-[hsl(var(--nav-theme-light))] max-w-3xl mx-auto mb-4">
              {t.modules.worldOfNukesIslandBuilding.subtitle}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.worldOfNukesIslandBuilding.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-4 md:space-y-6">
            {t.modules.worldOfNukesIslandBuilding.steps.map(
              (step: any, index: number) => (
                <div
                  key={index}
                  className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                    <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg md:text-xl font-bold mb-1.5">
                      <LinkedTitle
                        linkData={
                          moduleLinkMap[
                            `worldOfNukesIslandBuilding::steps::${index}`
                          ]
                        }
                        locale={locale}
                      >
                        {step.title}
                      </LinkedTitle>
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground mb-3">
                      {step.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.priorities.map((p: string, pi: number) => (
                        <span
                          key={pi}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-xs"
                        >
                          <Check className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))]" />
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* 广告位 6: 移动端横幅 320×50（8 模块中部的阅读停顿位） */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 6: Jets & Warships Guide */}
      <section
        id="jets-warships"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["worldOfNukesJetsWarships"]}
                locale={locale}
              >
                {t.modules.worldOfNukesJetsWarships.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg font-medium text-[hsl(var(--nav-theme-light))] max-w-3xl mx-auto mb-4">
              {t.modules.worldOfNukesJetsWarships.subtitle}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.worldOfNukesJetsWarships.intro}
            </p>
          </div>

          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.worldOfNukesJetsWarships.units.map(
              (unit: any, index: number) => (
                <div
                  key={index}
                  className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                      <DynamicIcon
                        name={unit.icon}
                        className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight">
                        <LinkedTitle
                          linkData={
                            moduleLinkMap[
                              `worldOfNukesJetsWarships::units::${index}`
                            ]
                          }
                          locale={locale}
                        >
                          {unit.title}
                        </LinkedTitle>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {unit.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {unit.description}
                  </p>
                  <ul className="space-y-1.5 mb-4">
                    {unit.tactics.map((tac: string, ti: number) => (
                      <li
                        key={ti}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                        {tac}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground border-t border-border pt-3">
                    <span className="font-semibold text-[hsl(var(--nav-theme-light))]">
                      Best for:{" "}
                    </span>
                    {unit.bestFor}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 7: Wonders & Doomsday Device */}
      <section
        id="wonders-doomsday"
        className="scroll-mt-24 px-4 py-14 md:py-20"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["worldOfNukesWondersDoomsday"]}
                locale={locale}
              >
                {t.modules.worldOfNukesWondersDoomsday.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg font-medium text-[hsl(var(--nav-theme-light))] max-w-3xl mx-auto mb-4">
              {t.modules.worldOfNukesWondersDoomsday.subtitle}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.worldOfNukesWondersDoomsday.intro}
            </p>
          </div>

          <div className="scroll-reveal space-y-3">
            {t.modules.worldOfNukesWondersDoomsday.panels.map(
              (panel: any, index: number) => (
                <div
                  key={index}
                  className="border border-border rounded-xl overflow-hidden bg-white/5"
                >
                  <button
                    onClick={() =>
                      setWonderExpanded(wonderExpanded === index ? null : index)
                    }
                    className="w-full flex items-center gap-3 p-5 text-left hover:bg-white/5 transition-colors"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--nav-theme)/0.1)]">
                      <DynamicIcon
                        name={panel.icon}
                        className="h-5 w-5 text-[hsl(var(--nav-theme-light))]"
                      />
                    </div>
                    <span className="flex-1">
                      <span className="block font-bold text-lg">
                        <LinkedTitle
                          linkData={
                            moduleLinkMap[
                              `worldOfNukesWondersDoomsday::panels::${index}`
                            ]
                          }
                          locale={locale}
                        >
                          {panel.title}
                        </LinkedTitle>
                      </span>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {panel.summary}
                      </span>
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform ${wonderExpanded === index ? "rotate-180" : ""}`}
                    />
                  </button>
                  {wonderExpanded === index && (
                    <div className="px-5 pb-5 space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {panel.content}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-lg">
                          <p className="text-xs font-semibold text-[hsl(var(--nav-theme-light))] uppercase tracking-wider mb-2">
                            {panel.requirementsLabel}
                          </p>
                          <ul className="space-y-1.5">
                            {panel.requirements.map((r: string, ri: number) => (
                              <li
                                key={ri}
                                className="flex items-start gap-2 text-sm text-muted-foreground"
                              >
                                <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                                {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {panel.effectsLabel && panel.effects.length > 0 && (
                          <div className="p-4 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-lg">
                            <p className="text-xs font-semibold text-[hsl(var(--nav-theme-light))] uppercase tracking-wider mb-2">
                              {panel.effectsLabel}
                            </p>
                            <ul className="space-y-1.5">
                              {panel.effects.map((e: string, ei: number) => (
                                <li
                                  key={ei}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                                  {e}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Module 8: Updates & Gamepasses */}
      <section
        id="updates-gamepasses"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              <LinkedTitle
                linkData={moduleLinkMap["worldOfNukesUpdatesGamepasses"]}
                locale={locale}
              >
                {t.modules.worldOfNukesUpdatesGamepasses.title}
              </LinkedTitle>
            </h2>
            <p className="text-base md:text-lg font-medium text-[hsl(var(--nav-theme-light))] max-w-3xl mx-auto mb-4">
              {t.modules.worldOfNukesUpdatesGamepasses.subtitle}
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
              {t.modules.worldOfNukesUpdatesGamepasses.intro}
            </p>
          </div>

          <div className="scroll-reveal overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="bg-[hsl(var(--nav-theme)/0.1)] border-b border-border">
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    {t.modules.worldOfNukesUpdatesGamepasses.tableHeaders.feature}
                  </th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    {t.modules.worldOfNukesUpdatesGamepasses.tableHeaders.category}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t.modules.worldOfNukesUpdatesGamepasses.tableHeaders.benefit}
                  </th>
                  <th className="px-4 py-3 font-semibold whitespace-nowrap">
                    {t.modules.worldOfNukesUpdatesGamepasses.tableHeaders.price}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    {t.modules.worldOfNukesUpdatesGamepasses.tableHeaders.bestFor}
                  </th>
                </tr>
              </thead>
              <tbody>
                {t.modules.worldOfNukesUpdatesGamepasses.entries.map(
                  (entry: any, index: number) => (
                    <tr
                      key={index}
                      className="border-b border-border last:border-b-0 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-4 font-semibold whitespace-nowrap">
                        <LinkedTitle
                          linkData={
                            moduleLinkMap[
                              `worldOfNukesUpdatesGamepasses::entries::${index}`
                            ]
                          }
                          locale={locale}
                        >
                          {entry.name}
                        </LinkedTitle>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap">
                          {entry.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {entry.benefit}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground text-xs whitespace-nowrap">
                        {entry.price}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground text-xs">
                        {entry.recommendedFor}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>

          <div className="scroll-reveal mt-6 flex justify-center">
            <a
              href="https://www.roblox.com/games/139707731553337/World-of-Nukes"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] text-sm hover:bg-[hsl(var(--nav-theme)/0.2)] transition-colors"
            >
              View current prices and updates on Roblox
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.roblox.com/games/139707731553337/World-of-Nukes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxGame}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.roblox.com/groups/957612245/Build-Defend-Nuke"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.robloxGroup}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
