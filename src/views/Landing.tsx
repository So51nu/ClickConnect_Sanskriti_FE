import React, { useMemo, useEffect, useRef, useState } from "react";
import { postEnquiry } from "../api";
const PROJECT_NAME = "Sanskriti by Jem World Group";
const PROJECT_SUB = "Exclusive 3 BHK Villa Floors • One Floor, One Apartment";
const LOCATION_LINE = "Daulat Nagar, Borivali East, Mumbai 400066";
const IMAGE_PATHS: string[] = ["/back1.jpeg", "/g7.jpeg", "/back3.jpeg", "/g6.jpeg"];
const LOGO_URLS = ["/images/sanskriti-logo.png", "/images/sanskriti-logo.jpeg", "/images/sanskriti-logo.jpg"];
const HERO_VIDEO_URL = "/images/sanskriti_video_bg.mp4";
const amenitiesData = [
  { title: "Looby", img: "/g1.jpeg" },
  { title: "GYM", img: "/g2.jpeg" },
  { title: "Powder Washroom", img: "/powderwashroom.jpeg" },
  { title: "Open View", img: "/g3.jpeg" },
  { title: "Bedroom", img: "/Bedroom.jpeg" },
  { title: "Lift", img: "/lift.jpeg" },
];

const galleryData = ["/g9.png", "/g10.png", "/g11.png", "/g4.jpeg", "/g6.jpeg", "/g5.jpeg"];
const BROCHURE_URL = "/brochure.pdf";
const MASTERPLAN_URL = "";
const COSTING_URL = "";
const PHONE = "+919892046053 / +919967817637";
const PHONE_PRIMARY = "+919892046053";
const EMAIL = "info@jemworld.com";
const WHATSAPP_NUMBER = "9892046053";
const WHATSAPP_TEXT = encodeURIComponent(`Hi, I want details for ${PROJECT_NAME}.`);
const DEEP_NAVY = "#0A1F44";
const ELEGANT_TEAL = "#007C8F";
const WARM_GOLD = "#C5A572";
const RICH_BURGUNDY = "#8B2332";
const LIGHT_BLUE = "#E8F4F8";
const MEDIUM_BLUE = "#2C5282";
const DARK_TEAL = "#005F73";
const PRIMARY_COLOR = DEEP_NAVY;
const SECONDARY_COLOR = ELEGANT_TEAL;
const ACCENT_COLORS = {
  navy: DEEP_NAVY,
  teal: ELEGANT_TEAL,
  gold: WARM_GOLD,
  burgundy: RICH_BURGUNDY,
  lightBlue: LIGHT_BLUE,
  mediumBlue: MEDIUM_BLUE,
  darkTeal: DARK_TEAL
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 10px",
  marginBottom: "16px",
  border: "none",
  borderBottom: "1px solid #ccc",
  outline: "none",
  fontSize: 14,
};

type LeadAction = "brochure" | "costing" | "masterplan" | "callback" | "generic";

function triggerDownload(url: string, filename?: string) {
  if (!url) return;
  try {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener";
    if (filename) a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch {
    window.open(url, "_blank", "noopener");
  }
}

export default function LandingPage() {
  const [currentImg, setCurrentImg] = useState<number>(0);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const [heroVideoFailed, setHeroVideoFailed] = useState(false);
  const [heroVideoAspectRatio, setHeroVideoAspectRatio] = useState("16 / 9");
  const [logoIndex, setLogoIndex] = useState(0);
  const logoFailed = logoIndex >= LOGO_URLS.length;

  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadAction, setLeadAction] = useState<LeadAction>("generic");

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [form, setForm] = useState({ name: "", mobile: "", email: "" });

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const leadOpenRef = useRef(showLeadModal);
  const previewRef = useRef(previewImg);
  const videoRef = useRef(showVideo);
  const loadingRef = useRef(loading);
  const leadOpenedOnceRef = useRef(false);

  useEffect(() => {
    leadOpenRef.current = showLeadModal;
  }, [showLeadModal]);

  useEffect(() => {
    previewRef.current = previewImg;
  }, [previewImg]);

  useEffect(() => {
    videoRef.current = showVideo;
  }, [showVideo]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const heroVideoActive = heroVideoReady && !heroVideoFailed;

  useEffect(() => {
    const interval = setInterval(() => {
      if (heroVideoActive) return;
      setCurrentImg((prev) => (prev + 1) % IMAGE_PATHS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroVideoActive]);

  const mobile10 = useMemo(
    () => form.mobile.replace(/\s/g, "").replace(/[^0-9]/g, ""),
    [form.mobile]
  );

  const isValid = useMemo(() => {
    const nameOk = form.name.trim().length >= 2;
    const mobileOk = /^\d{10}$/.test(mobile10);
    const email = form.email.trim();
    const emailOk = email.length === 0 ? true : /.+@.+\..+/.test(email);
    return nameOk && mobileOk && emailOk;
  }, [form.name, form.email, mobile10]);

  function openLead(action: LeadAction) {
    leadOpenedOnceRef.current = true;
    setLeadAction(action);
    setErrorText("");
    setShowLeadModal(true);
  }

  async function submitEnquiry(opts?: { autoCloseModal?: boolean; downloadAfter?: LeadAction }) {
    if (loading) return;

    setErrorText("");
    if (!isValid) {
      setErrorText("Please enter valid Name + 10 digit Mobile (Email optional).");
      return;
    }

    setLoading(true);
    try {
      await postEnquiry({
        name: form.name.trim(),
        mobile: mobile10,
        email: form.email.trim(),
      });

      setDone(true);
      setForm({ name: "", mobile: "", email: "" });

      const action = opts?.downloadAfter ?? leadAction;

      if (action === "brochure") {
        if (BROCHURE_URL) triggerDownload(BROCHURE_URL, "Sanskriti-Brochure.pdf");
      } else if (action === "masterplan") {
        if (MASTERPLAN_URL) triggerDownload(MASTERPLAN_URL, "Sanskriti-Masterplan.pdf");
      } else if (action === "costing") {
        if (COSTING_URL) triggerDownload(COSTING_URL, "Sanskriti-Price-Sheet.pdf");
      }

      if (opts?.autoCloseModal) setShowLeadModal(false);
      setTimeout(() => setDone(false), 2500);
    } catch (e) {
      setErrorText("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (leadOpenedOnceRef.current) return;
      if (leadOpenRef.current) return;
      if (previewRef.current) return;
      if (videoRef.current) return;
      if (loadingRef.current) return;
      openLead("callback");
    }, 30000);

    return () => window.clearTimeout(id);
  }, []);

  const headerHeight = 65;
  const rightSectionWidth = "22%";

  function scrollToSection(sectionId: string) {
    const target = document.getElementById(sectionId);
    if (!target) return;

    if (isMobile || isTablet) {
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top, behavior: "smooth" });
      setShowMobileMenu(false);
      return;
    }

    const container = document.querySelector(".left-pane") as HTMLDivElement | null;
    if (container) {
      const top = (target as HTMLElement).offsetTop - headerHeight;
      container.scrollTo({ top, behavior: "smooth" });
    }
  }

  const EnquiryBlock = ({ compact }: { compact?: boolean }) => (
    <div
      style={{
        width: "100%",
        background: "#fff",
        border: compact ? `1px solid ${ACCENT_COLORS.teal}20` : "none",
        borderRadius: compact ? 12 : 0,
        padding: compact ? "16px 14px" : 0,
        boxShadow: compact ? "0 10px 24px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontSize: "18px", color: DEEP_NAVY, marginBottom: "18px", marginTop: 0 }}>
          Get The Best Quote
        </h3>

        {done ? (
          <div
            style={{
              display: "inline-block",
              marginBottom: 10,
              padding: "6px 10px",
              fontSize: 12,
              borderRadius: 999,
              background: `${ACCENT_COLORS.teal}15`,
              border: `1px solid ${ACCENT_COLORS.teal}40`,
              color: ACCENT_COLORS.teal,
              fontWeight: 700,
            }}
          >
            Submitted ✓
          </div>
        ) : null}

        {errorText ? (
          <div style={{ marginBottom: 10, fontSize: 12, color: "#b00020", fontWeight: 600 }}>
            {errorText}
          </div>
        ) : null}

        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          style={{
            width: "100%",
            padding: "12px 10px",
            margin: "10px 0",
            border: `1px solid ${ACCENT_COLORS.teal}30`,
            borderRadius: "6px",
            outline: "none",
            fontSize: "14px",
          }}
          placeholder="Name"
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          style={{
            width: "100%",
            padding: "12px 10px",
            margin: "10px 0",
            border: `1px solid ${ACCENT_COLORS.teal}30`,
            borderRadius: "6px",
            outline: "none",
            fontSize: "14px",
          }}
          placeholder="Email Address(Optional)"
        />
        <input
          type="tel"
          inputMode="numeric"
          value={form.mobile}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              mobile: e.target.value.replace(/[^0-9\s]/g, ""),
            }))
          }
          style={{
            width: "100%",
            padding: "12px 10px",
            margin: "10px 0",
            border: `1px solid ${ACCENT_COLORS.teal}30`,
            borderRadius: "6px",
            outline: "none",
            fontSize: "14px",
          }}
          placeholder="Phone number"
        />

        <button
          disabled={!isValid || loading}
          onClick={() => submitEnquiry({ autoCloseModal: false })}
          style={{
            backgroundColor: DEEP_NAVY,
            background: `linear-gradient(135deg, ${DEEP_NAVY}, ${ACCENT_COLORS.teal})`,
            color: "#fff",
            border: "none",
            padding: "15px",
            width: "100%",
            marginTop: "18px",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: !isValid || loading ? "not-allowed" : "pointer",
            opacity: !isValid || loading ? 0.65 : 1,
          }}
        >
          {loading ? "Submitting..." : "Get It Now"}
        </button>
      </div>
    </div>
  );

  const pricingRows = [
    { type: "3 BHK Villa Floor", area: "1002 sq.ft", price: "₹ 2.80 Cr Onwards*" },
    { type: "3 BHK Villa Floor", area: "1155 sq.ft", price: "₹ 3.21 Cr Onwards*" },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: isMobile || isTablet ? "auto" : "100vh",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: isMobile || isTablet ? "visible" : "hidden",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#fff",
        paddingBottom: isMobile ? 78 : 0,
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { width: 100%; overflow-x: hidden; }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .nav-item { transition: background .2s ease, color .2s ease; }
        .nav-item:hover { background: ${ACCENT_COLORS.teal}10; color: ${ACCENT_COLORS.teal}; }
        .nav-item:active { transform: translateY(0.5px); }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #eee; padding: 12px; text-align: left; font-size: 14px; }
        th { background-color: #f8f8f8; color: ${DEEP_NAVY}; }
        tr:hover td { background: ${ACCENT_COLORS.teal}05; }
        @keyframes scrollX {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mobile-only { display: block !important; }
          .section-pad { padding: 40px 20px !important; }
          .hero-pad { padding: 20px !important; }
          th, td { font-size: 12px; padding: 8px; }
          table { font-size: 12px; }
          h2 { font-size: 22px !important; }
          h3 { font-size: 18px !important; }
          p { font-size: 14px !important; }
          .layout-wrap { flex-direction: column !important; }
          .left-pane, .right-pane { width: 100% !important; }
        }
        @media (min-width: 769px) and (max-width: 1024px) {
          .tablet-hide { display: none !important; }
          .section-pad { padding: 50px 40px !important; }
          .layout-wrap { flex-direction: column !important; }
          .left-pane, .right-pane { width: 100% !important; height: auto !important; }
          .right-pane { border-left: none !important; border-top: 1px solid #ddd; }
        }
        @media (min-width: 1025px) {
          .mobile-only { display: none !important; }
          .mobile-tablet-only { display: none !important; }
        }

        @media (min-width: 1025px) {
          .nav-wrap { min-width: 0; }
          .header-right { min-width: 0; }
        }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>

      
      {isMobile && (
        <button
          onClick={() => openLead("brochure")}
          style={{
            position: "fixed",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 9998,
            border: `1px solid ${DEEP_NAVY}30`,
            background: "#fff",
            borderRadius: 14,
            padding: "10px 10px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
            cursor: "pointer",
          }}
          aria-label="Download Brochure"
        >
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${ACCENT_COLORS.teal}15`,
              color: ACCENT_COLORS.teal,
              fontWeight: 900,
            }}
          >
            PDF
          </span>
          <span
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontWeight: 800,
              fontSize: 12,
              color: DEEP_NAVY,
              letterSpacing: 0.4,
            }}
          >
            Download Brochure
          </span>
        </button>
      )}

      
      <header
        style={{
          height: `${headerHeight}px`,
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${ACCENT_COLORS.teal}30`,
          backgroundColor: "#fff",
          zIndex: isMobile || isTablet ? 10000 : 1000,
          position: isMobile || isTablet ? "fixed" : "sticky",
          top: 0,
          left: isMobile || isTablet ? 0 : undefined,
          right: isMobile || isTablet ? 0 : undefined,
          width: "100%",
          boxShadow: isMobile || isTablet ? "0 2px 12px rgba(10,31,68,0.10)" : "none",
        }}
      >
        <button
          type="button"
          onClick={() => {
            if (isMobile || isTablet) {
              window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
              document.querySelector(".left-pane")?.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          aria-label="Sanskriti - Home"
          style={{
            width: isMobile || isTablet ? "160px" : "154px",
            height: "100%",
            padding: isMobile || isTablet ? "4px 10px" : "2px 7px",
            flexShrink: 0,
            background: "#fff",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: isMobile || isTablet ? "flex-start" : "center",
            cursor: "pointer",
          }}
        >
          {!logoFailed ? (
            <img
              src={LOGO_URLS[logoIndex]}
              alt="Sanskriti"
              onError={() => setLogoIndex((current) => current + 1)}
              style={{
                display: "block",
                maxWidth: isMobile || isTablet ? "132px" : "140px",
                maxHeight: isMobile || isTablet ? "58px" : "62px",
                width: "auto",
                height: "auto",
                objectFit: "contain",
              }}
            />
          ) : (
            <span style={{ color: DEEP_NAVY, fontWeight: 900, fontSize: "20px" }}>Sanskriti</span>
          )}
        </button>

        {!isMobile && !isTablet && (
          <nav
            className="nav-wrap"
            style={{
              display: "flex",
              height: "100%",
              flex: 1,
              minWidth: 0,
              alignItems: "center",
            }}
          >
            <div
              style={{
                backgroundColor: ACCENT_COLORS.teal,
                color: "#fff",
                padding: 0,
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flex: "0 0 clamp(56px, 4vw, 66px)",
                minWidth: 0,
              }}
              onClick={() => {
                if (isMobile || isTablet) {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                  document.querySelector(".left-pane")?.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            >
              🏠
            </div>

            {[
              { label: "Price", id: "price" },
              { label: "Site & Floor Plan", id: "site-plan" },
              { label: "Amenities", id: "amenities" },
              { label: "Gallery", id: "gallery" },
              { label: "Location", id: "location" },
              { label: "Virtual Site Visit", id: "virtual-visit" },
              { label: "Download Brochure", id: "price" },
            ].map((item) => (
              <div
                key={item.label}
                className="nav-item"
                onClick={() => {
                  if (item.label === "Download Brochure") {
                    openLead("brochure");
                    return;
                  }
                  scrollToSection(item.id);
                }}
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 clamp(5px, .5vw, 9px)",
                  fontSize: "clamp(10px, .73vw, 12px)",
                  lineHeight: 1.15,
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  color: DEEP_NAVY,
                  borderRight: `1px solid ${ACCENT_COLORS.teal}20`,
                  cursor: "pointer",
                  flex: "1 1 0",
                  minWidth: 0,
                  fontWeight: 600,
                }}
              >
                {item.label}
              </div>
            ))}

            <div
              style={{
                height: "100%",
                flex: "0 0 clamp(104px, 7.4vw, 126px)",
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 clamp(6px, .55vw, 10px)",
              }}
            >
              <a
                href="/admin"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "7px clamp(10px, .75vw, 14px)",
                  borderRadius: "999px",
                  border: `1px solid ${DEEP_NAVY}40`,
                  fontSize: "clamp(10px, .75vw, 12px)",
                  whiteSpace: "nowrap",
                  color: DEEP_NAVY,
                  textDecoration: "none",
                  background: "#fff",
                  fontWeight: 600,
                }}
              >
                Admin Login
              </a>
            </div>
          </nav>
        )}

        {!isMobile && !isTablet && (
          <div className="header-right" style={{ display: "flex", height: "100%", width: rightSectionWidth }}>
            <div
              onClick={() => openLead("costing")}
              style={{
                flex: 1,
                backgroundColor: ACCENT_COLORS.mediumBlue,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                padding: "0 clamp(6px, .65vw, 10px)",
                gap: "8px",
                cursor: "pointer",
                minWidth: 0,
                justifyContent: "center",
              }}
            >
              📄
              <div style={{ fontSize: "10px", lineHeight: 1.2 }}>
                Download <br />
                <b>Price Sheet</b>
              </div>
            </div>

            <div
              style={{
                flex: 1,
                backgroundColor: DEEP_NAVY,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                padding: "0 clamp(6px, .65vw, 10px)",
                gap: "5px",
                minWidth: 0,
                justifyContent: "center",
                whiteSpace: "nowrap",
                textAlign: "center",
              }}
            >
              📞 <b style={{ fontSize: "clamp(9px, .66vw, 11px)" }}>{PHONE}</b>
            </div>
          </div>
        )}

        {(isMobile || isTablet) && (
          <button
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label={showMobileMenu ? "Close menu" : "Open menu"}
            style={{
              marginLeft: "auto",
              width: 58,
              height: "100%",
              padding: 0,
              background: "none",
              border: "none",
              color: DEEP_NAVY,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 27,
              lineHeight: 1,
            }}
          >
            {showMobileMenu ? "×" : "☰"}
          </button>
        )}
      </header>

      
      {(isMobile || isTablet) && showMobileMenu && (
        <div
          style={{
            position: "fixed",
            top: headerHeight,
            left: 0,
            right: 0,
            bottom: 0,
            background: DEEP_NAVY,
            zIndex: 9999,
            animation: "fadeIn 0.3s ease",
            display: "flex",
            flexDirection: "column",
            padding: "20px",
          }}
        >
          {[
            { label: "Home", id: "home", icon: "🏠" },
            { label: "Price", id: "price", icon: "💰" },
            { label: "Site & Floor Plan", id: "site-plan", icon: "📐" },
            { label: "Amenities", id: "amenities", icon: "🏊" },
            { label: "Gallery", id: "gallery", icon: "📸" },
            { label: "Location", id: "location", icon: "📍" },
            { label: "Virtual Site Visit", id: "virtual-visit", icon: "🎥" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => scrollToSection(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                padding: "20px 10px",
                background: "none",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                color: "#fff",
                fontSize: "18px",
                textAlign: "left",
                cursor: "pointer",
                width: "100%",
              }}
            >
              <span style={{ fontSize: "20px" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <button
            onClick={() => {
              openLead("brochure");
              setShowMobileMenu(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "20px 10px",
              background: ACCENT_COLORS.teal,
              border: "none",
              color: "#fff",
              fontSize: "18px",
              textAlign: "left",
              cursor: "pointer",
              width: "100%",
              marginTop: "20px",
              borderRadius: "8px",
              fontWeight: "bold",
            }}
          >
            <span style={{ fontSize: "20px" }}>📄</span>
            Download Brochure
          </button>

          <a
            href="/admin"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "20px 10px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "#fff",
              fontSize: "16px",
              textDecoration: "none",
              width: "100%",
              marginTop: "10px",
              borderRadius: "8px",
              justifyContent: "center",
            }}
          >
            👤 Admin Login
          </a>
        </div>
      )}

      
      <div
        className="layout-wrap"
        style={{
          display: "flex",
          flex: 1,
          overflow: isMobile || isTablet ? "visible" : "hidden",
          marginTop: isMobile || isTablet ? headerHeight : 0,
        }}
      >
        
        <div
          className="hide-scroll left-pane"
          style={{
            width: isMobile || isTablet ? "100%" : heroVideoActive ? "100%" : "78%",
            height: isMobile || isTablet ? "auto" : "100%",
            overflowY: isMobile || isTablet ? "visible" : "auto",
          }}
        >
          
          {(isMobile || isTablet) ? (
            <section
              id="home"
              style={{
                width: "100%",
                height: heroVideoActive ? "auto" : `calc(100vh - ${headerHeight}px)`,
                minHeight: heroVideoActive ? 0 : undefined,
                aspectRatio: heroVideoActive ? heroVideoAspectRatio : undefined,
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <img
                src={IMAGE_PATHS[currentImg]}
                alt="Hero"
                style={{
                  display: heroVideoActive ? "none" : "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 1,
                }}
              />

              {!heroVideoFailed && (
                <video
                  src={HERO_VIDEO_URL}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={IMAGE_PATHS[0]}
                  aria-label="Sanskriti project video"
                  onLoadedMetadata={(e) => {
                    const video = e.currentTarget;
                    if (video.videoWidth && video.videoHeight) {
                      setHeroVideoAspectRatio(`${video.videoWidth} / ${video.videoHeight}`);
                    }
                    setHeroVideoReady(true);
                  }}
                  onCanPlay={(e) => {
                    setHeroVideoReady(true);
                    e.currentTarget.play().catch(() => {});
                  }}
                  onError={() => {
                    setHeroVideoFailed(true);
                    setHeroVideoReady(false);
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "center center",
                    display: "block",
                    background: "#000",
                    zIndex: 2,
                    pointerEvents: "none",
                  }}
                />
              )}

              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: heroVideoActive ? `${DEEP_NAVY}1A` : `${DEEP_NAVY}60`,
                  zIndex: 3,
                  pointerEvents: "none",
                }}
              />
            </section>
          ) : (
            <section
              className="hero-pad"
              style={{
                minHeight: heroVideoActive ? undefined : `calc(100vh - ${headerHeight}px)`,
                height: heroVideoActive ? `calc(100vh - ${headerHeight}px - 34px)` : undefined,
                width: "100%",
                maxWidth: undefined,
                margin: 0,
                borderRadius: 0,
                backgroundImage: heroVideoActive ? "none" : `url(${IMAGE_PATHS[currentImg]})`,
                backgroundColor: "#000",
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: heroVideoActive ? "center" : undefined,
                padding: heroVideoActive ? 0 : "30px",
                position: "relative",
                overflow: "hidden",
                boxShadow: undefined,
              }}
            >
              {!heroVideoFailed && (
                <video
                  src={HERO_VIDEO_URL}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={IMAGE_PATHS[0]}
                  aria-label="Sanskriti project video"
                  onLoadedMetadata={() => setHeroVideoReady(true)}
                  onCanPlay={(e) => {
                    setHeroVideoReady(true);
                    e.currentTarget.play().catch(() => {});
                  }}
                  onError={() => {
                    setHeroVideoFailed(true);
                    setHeroVideoReady(false);
                  }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center center",
                    display: "block",
                    background: "#000",
                    zIndex: 1,
                    pointerEvents: "none",
                  }}
                />
              )}

              {heroVideoActive && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.06)",
                    zIndex: 2,
                    pointerEvents: "none",
                  }}
                />
              )}
              {!heroVideoActive && (
                <div
                  style={{
                    position: "relative",
                    zIndex: 3,
                    backgroundColor: "#ffffff",
                    width: "340px",
                  borderRadius: "8px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
                  overflow: "hidden",
                  fontFamily: "sans-serif",
                }}
              >
                <div
                  style={{
                    backgroundColor: ACCENT_COLORS.teal,
                    color: "#fff",
                    padding: "10px",
                    textAlign: "center",
                    fontWeight: 800,
                    fontSize: "13px",
                  }}
                >
                  OC Received • Possession: June 2027
                </div>

                <div style={{ padding: "18px", textAlign: "center" }}>
                  <h2 style={{ fontSize: "22px", margin: "0 0 8px", fontWeight: 900, lineHeight: 1.2, color: DEEP_NAVY }}>
                    {PROJECT_NAME}
                  </h2>

                  <div
                    style={{
                      backgroundColor: DEEP_NAVY,
                      color: "#fff",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 800,
                      display: "inline-block",
                      marginBottom: "12px",
                    }}
                  >
                    {PROJECT_SUB}
                  </div>

                  <div
                    style={{
                      backgroundColor: `${ACCENT_COLORS.lightBlue}10`,
                      padding: "10px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      marginBottom: "14px",
                      textAlign: "left",
                      border: `1px solid ${ACCENT_COLORS.lightBlue}30`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Sizes</span>
                      <strong>1002 & 1155 sq.ft</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                      <span>Configuration</span>
                      <strong>3 Master Bedrooms</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      border: `2px dashed ${ACCENT_COLORS.gold}`,
                      backgroundColor: `${ACCENT_COLORS.gold}15`,
                      color: DEEP_NAVY,
                      padding: "14px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: 800,
                      lineHeight: "1.55",
                      marginBottom: "14px",
                    }}
                  >
                    Pay Just <b>10%</b> Now <br />
                    Enjoy <b>NO EMI</b> Till Possession <br />
                    10:90 / Flexi Payment Options
                  </div>

                  <div style={{ fontSize: "13px", color: ACCENT_COLORS.teal, marginBottom: "6px" }}>
                    Starting From
                  </div>

                  <div style={{ fontSize: "30px", fontWeight: 900, color: ACCENT_COLORS.burgundy }}>
                    ₹ 2.80 Cr* <span style={{ fontSize: "14px", fontWeight: 600, color: DEEP_NAVY }}>Onwards</span>
                  </div>

                  <button
                    onClick={() => openLead("brochure")}
                    style={{
                      background: `linear-gradient(90deg, ${DEEP_NAVY}, ${ACCENT_COLORS.teal})`,
                      color: "#fff",
                      border: "none",
                      padding: "14px",
                      width: "100%",
                      marginTop: "16px",
                      cursor: "pointer",
                      fontWeight: 900,
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    Download Brochure
                  </button>
                </div>
              </div>
              )}
            </section>
          )}

          
          {(isMobile || isTablet) && (
            <div
              style={{
                padding: "20px",
                backgroundColor: "#fff",
                marginTop: heroVideoActive ? 0 : "-100px",
                position: "relative",
                zIndex: 3,
                borderRadius: "20px 20px 0 0",
                boxShadow: "0 -10px 30px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  backgroundColor: "#ffffff",
                  width: "100%",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                  overflow: "hidden",
                  fontFamily: "sans-serif",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    backgroundColor: ACCENT_COLORS.teal,
                    color: "#fff",
                    padding: "12px",
                    textAlign: "center",
                    fontWeight: 900,
                    fontSize: "14px",
                  }}
                >
                  OC Received • Possession: June 2027
                </div>

                <div style={{ padding: "20px", textAlign: "center" }}>
                  <h2 style={{ fontSize: "20px", margin: "0 0 10px", fontWeight: 900, lineHeight: 1.2, color: DEEP_NAVY }}>
                    {PROJECT_NAME}
                  </h2>

                  <div
                    style={{
                      backgroundColor: DEEP_NAVY,
                      color: "#fff",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: 900,
                      display: "inline-block",
                      marginBottom: "14px",
                    }}
                  >
                    {PROJECT_SUB}
                  </div>

                  <div
                    style={{
                      backgroundColor: `${ACCENT_COLORS.lightBlue}10`,
                      padding: "12px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      marginBottom: "16px",
                      textAlign: "center",
                      border: `1px solid ${ACCENT_COLORS.lightBlue}30`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span>Sizes</span>
                      <strong>1002 & 1155 sq.ft</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>Layout</span>
                      <strong>3-side open</strong>
                    </div>
                  </div>

                  <div
                    style={{
                      border: `2px dashed ${ACCENT_COLORS.gold}`,
                      backgroundColor: `${ACCENT_COLORS.gold}15`,
                      color: DEEP_NAVY,
                      padding: "14px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 900,
                      lineHeight: "1.6",
                      marginBottom: "16px",
                    }}
                  >
                    Pay Just <b>10%</b> Now <br />
                    Enjoy <b>NO EMI</b> Till Possession <br />
                    10:90 / Flexi Payment Options
                  </div>

                  <div style={{ fontSize: "14px", color: ACCENT_COLORS.teal, marginBottom: "8px" }}>Starting From</div>

                  <div style={{ fontSize: "28px", fontWeight: 900, marginBottom: "16px", color: ACCENT_COLORS.burgundy }}>
                    ₹ 2.80 Cr* <span style={{ fontSize: "14px", fontWeight: 600, color: DEEP_NAVY }}>Onwards</span>
                  </div>

                  <button
                    onClick={() => openLead("brochure")}
                    style={{
                      background: `linear-gradient(90deg, ${DEEP_NAVY}, ${ACCENT_COLORS.teal})`,
                      color: "#fff",
                      border: "none",
                      padding: "14px",
                      width: "100%",
                      marginTop: "10px",
                      cursor: "pointer",
                      fontWeight: 900,
                      borderRadius: "8px",
                      fontSize: "16px",
                    }}
                  >
                    Download Brochure
                  </button>
                </div>
              </div>

              <EnquiryBlock compact />
            </div>
          )}

          
          <section
            className="section-pad"
            style={{
              padding: isMobile ? "42px 18px" : isTablet ? "52px 28px" : "72px 48px",
              backgroundColor: "#fff",
              fontFamily: "'Poppins', 'Segoe UI', sans-serif",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "1180px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: isMobile ? "9px 16px" : "10px 22px",
                  marginBottom: isMobile ? 16 : 20,
                  borderRadius: 999,
                  background: `linear-gradient(90deg, ${DEEP_NAVY}, ${ACCENT_COLORS.teal})`,
                  color: "#fff",
                  fontSize: isMobile ? 13 : 15,
                  fontWeight: 900,
                  letterSpacing: "0.5px",
                  boxShadow: "0 8px 22px rgba(10,31,68,0.16)",
                }}
              >
                <span style={{ fontSize: isMobile ? 15 : 17 }}>✓</span>
                OC RECEIVED
              </div>

              <div style={{ width: "100%", maxWidth: "980px", margin: "0 auto" }}>
                <h2
                  style={{
                    margin: 0,
                    color: DEEP_NAVY,
                    fontSize: isMobile ? "30px" : isTablet ? "36px" : "44px",
                    fontWeight: 900,
                    lineHeight: 1.15,
                    letterSpacing: "-0.6px",
                    textAlign: "center",
                  }}
                >
                  Introducing Sanskriti
                </h2>

                <h3
                  style={{
                    margin: isMobile ? "10px auto 22px" : "12px auto 28px",
                    color: ACCENT_COLORS.teal,
                    fontSize: isMobile ? "20px" : isTablet ? "24px" : "29px",
                    fontWeight: 800,
                    lineHeight: 1.35,
                    textAlign: "center",
                  }}
                >
                  Your Own Villa Floor in Prime Borivali East
                </h3>

                <div
                  style={{
                    width: isMobile ? "56px" : "72px",
                    height: 3,
                    margin: isMobile ? "0 auto 24px" : "0 auto 30px",
                    borderRadius: 999,
                    background: ACCENT_COLORS.gold,
                  }}
                />

                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: isMobile ? 14 : 16,
                  }}
                >
                  <p
                    style={{
                      width: "100%",
                      maxWidth: "930px",
                      margin: 0,
                      color: "#31415f",
                      fontSize: isMobile ? "15px" : isTablet ? "16px" : "17px",
                      lineHeight: isMobile ? 1.75 : 1.9,
                      fontWeight: 500,
                      textAlign: "center",
                    }}
                  >
                    A landmark development by <b style={{ color: ACCENT_COLORS.teal }}>Jem World Group</b> — a 3rd-generation developer known for quality, timely delivery and exceptional customer service. Experience an <b style={{ color: ACCENT_COLORS.teal }}>exclusive 3 BHK Villa Floor concept</b> with <b style={{ color: ACCENT_COLORS.teal }}>one floor, one apartment</b> in Daulat Nagar, Borivali East.
                  </p>

                  <p
                    style={{
                      width: "100%",
                      maxWidth: "930px",
                      margin: 0,
                      color: "#31415f",
                      fontSize: isMobile ? "15px" : isTablet ? "16px" : "17px",
                      lineHeight: isMobile ? 1.75 : 1.9,
                      fontWeight: 500,
                      textAlign: "center",
                    }}
                  >
                    Designed for luxury, privacy and positive energy, the project offers <b style={{ color: ACCENT_COLORS.teal }}>Vastu-compliant homes</b>, a <b style={{ color: ACCENT_COLORS.teal }}>3-side open layout</b>, <b style={{ color: ACCENT_COLORS.teal }}>3 master bedrooms</b>, a powder washroom and panoramic views towards <b style={{ color: ACCENT_COLORS.teal }}>Sanjay Gandhi National Park</b>.
                  </p>
                </div>
              </div>

              <div
                style={{
                  width: "100%",
                  marginTop: isMobile ? 28 : 38,
                  padding: isMobile ? "20px 14px" : isTablet ? "24px 20px" : "30px 28px",
                  background: `linear-gradient(180deg, ${ACCENT_COLORS.teal}08 0%, #ffffff 100%)`,
                  border: `1px solid ${ACCENT_COLORS.teal}28`,
                  borderRadius: 16,
                  boxShadow: "0 12px 35px rgba(10,31,68,0.06)",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: isMobile ? 18 : 24,
                  }}
                >
                  <h4
                    style={{
                      margin: 0,
                      color: DEEP_NAVY,
                      fontSize: isMobile ? "21px" : "25px",
                      fontWeight: 900,
                      lineHeight: 1.2,
                      textAlign: "center",
                    }}
                  >
                    Key Highlights
                  </h4>
                  <div
                    style={{
                      width: 44,
                      height: 3,
                      marginTop: 10,
                      borderRadius: 999,
                      background: ACCENT_COLORS.teal,
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : isTablet
                        ? "repeat(2, minmax(0, 1fr))"
                        : "repeat(3, minmax(0, 1fr))",
                    gap: isMobile ? 10 : 14,
                    width: "100%",
                    alignItems: "stretch",
                  }}
                >
                  {[
                    "Exclusive 3 BHK layout with Villa Floor concept",
                    "Niche gentry / premium neighborhood",
                    "Freehold land (most nearby are redevelopment)",
                    "Developer's legacy (3rd generation)",
                    "Daulat Nagar's premium project",
                    "3-side open view",
                    "All 3 master bedrooms + powder washroom",
                    "Butterfly layout with efficient planning",
                    "Quality product & premium finishes",
                    "Connectivity to Metro Rail & Western Express Highway",
                    "Jain Derasar & Swaminarayan temple within ~200m",
                    "Non-cosmo project",
                    "10:90 scheme & flexi payment options",
                    "OC Received",
                  ].map((item) => {
                    const isOc = item === "OC Received";
                    return (
                      <div
                        key={item}
                        style={{
                          minHeight: isMobile ? 0 : 74,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 9,
                          padding: isMobile ? "13px 12px" : "14px 16px",
                          borderRadius: 10,
                          background: isOc ? `${ACCENT_COLORS.gold}1F` : "#fff",
                          border: isOc
                            ? `1px solid ${ACCENT_COLORS.gold}`
                            : `1px solid ${ACCENT_COLORS.teal}20`,
                          boxShadow: isOc ? "0 6px 18px rgba(197,165,114,0.14)" : "none",
                          color: DEEP_NAVY,
                          fontSize: isMobile ? 14 : 14.5,
                          fontWeight: isOc ? 900 : 600,
                          lineHeight: 1.45,
                          textAlign: "center",
                          boxSizing: "border-box",
                        }}
                      >
                        <span
                          style={{
                            flex: "0 0 auto",
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: isOc ? ACCENT_COLORS.gold : `${ACCENT_COLORS.teal}12`,
                            color: isOc ? "#fff" : ACCENT_COLORS.teal,
                            fontSize: 12,
                            fontWeight: 900,
                          }}
                        >
                          ✓
                        </span>
                        <span>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div
                style={{
                  width: "100%",
                  maxWidth: "980px",
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
                  gap: 12,
                  marginTop: isMobile ? 20 : 24,
                }}
              >
                {[
                  { label: "Starting Price", value: "₹2.80 Cr Onwards*", tone: DEEP_NAVY },
                  { label: "Payment Benefit", value: "Pay 10% Now • No EMI Till Possession", tone: ACCENT_COLORS.teal },
                  { label: "Project Status", value: "OC Received", tone: ACCENT_COLORS.burgundy },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      minHeight: isMobile ? 76 : 88,
                      padding: "14px 16px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      borderRadius: 12,
                      background: "#fff",
                      border: `1px solid ${item.tone}25`,
                      boxShadow: "0 7px 20px rgba(10,31,68,0.05)",
                      boxSizing: "border-box",
                    }}
                  >
                    <span
                      style={{
                        marginBottom: 5,
                        color: "#718096",
                        fontSize: 12,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {item.label}
                    </span>
                    <strong
                      style={{
                        color: item.tone,
                        fontSize: isMobile ? 14 : 15,
                        fontWeight: 900,
                        lineHeight: 1.45,
                      }}
                    >
                      {item.value}
                    </strong>
                  </div>
                ))}
              </div>

              <button
                onClick={() => openLead("brochure")}
                style={{
                  marginTop: isMobile ? 24 : 30,
                  minWidth: isMobile ? "100%" : 220,
                  maxWidth: isMobile ? 360 : "none",
                  padding: isMobile ? "13px 22px" : "14px 34px",
                  background: `linear-gradient(90deg, ${DEEP_NAVY}, ${ACCENT_COLORS.teal})`,
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: isMobile ? 14 : 16,
                  fontWeight: 900,
                  boxShadow: "0 8px 20px rgba(10,31,68,0.12)",
                }}
              >
                Download Brochure
              </button>
            </div>
          </section>

          
          <section
            id="price"
            className="section-pad"
            style={{
              padding: isMobile || isTablet ? "30px 20px" : "60px 50px",
              backgroundColor: `${ACCENT_COLORS.lightBlue}05`,
              fontFamily: "'Poppins', 'Segoe UI', sans-serif",
            }}
          >
            <h2
              style={{
                color: DEEP_NAVY,
                fontSize: isMobile || isTablet ? "24px" : "28px",
                marginTop: 0,
                marginBottom: isMobile || isTablet ? "16px" : "24px",
                fontWeight: 800,
              }}
            >
              Sanskriti Pricing & Carpet Area
            </h2>

            <div
              style={{
                display: "flex",
                gap: isMobile || isTablet ? "20px" : "30px",
                flexDirection: isMobile || isTablet ? "column" : "row",
                alignItems: "flex-start",
              }}
            >
              <div style={{ flex: isMobile || isTablet ? "none" : 2, width: "100%" }}>
                {isMobile ? (
                  <div style={{ display: "grid", gap: 12 }}>
                    {pricingRows.map((r) => (
                      <div
                        key={r.area}
                        style={{
                          border: `1px solid ${ACCENT_COLORS.teal}30`,
                          borderRadius: 12,
                          padding: 14,
                          background: "#fff",
                          boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
                        }}
                      >
                        <div style={{ fontWeight: 900, color: DEEP_NAVY, fontSize: 15, marginBottom: 6 }}>{r.type}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                          <span style={{ color: ACCENT_COLORS.teal }}>Carpet</span>
                          <b style={{ color: DEEP_NAVY }}>{r.area}</b>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 12 }}>
                          <span style={{ color: ACCENT_COLORS.teal }}>Price</span>
                          <b style={{ color: ACCENT_COLORS.burgundy }}>{r.price}</b>
                        </div>
                        <button
                          onClick={() => openLead("generic")}
                          style={{
                            width: "100%",
                            backgroundColor: ACCENT_COLORS.mediumBlue,
                            color: "#fff",
                            border: "none",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            cursor: "pointer",
                            fontWeight: 800,
                            fontSize: 14,
                          }}
                        >
                          Price Breakup
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", border: `1px solid ${ACCENT_COLORS.teal}30` }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "14px", textAlign: "left", fontWeight: 800, backgroundColor: `${DEEP_NAVY}10`, color: DEEP_NAVY }}>Type</th>
                        <th style={{ padding: "14px", textAlign: "left", fontWeight: 800, backgroundColor: `${DEEP_NAVY}10`, color: DEEP_NAVY }}>Carpet Area</th>
                        <th style={{ padding: "14px", textAlign: "left", fontWeight: 800, backgroundColor: `${DEEP_NAVY}10`, color: DEEP_NAVY }}>Price</th>
                        <th style={{ padding: "14px", textAlign: "left", fontWeight: 800, backgroundColor: `${DEEP_NAVY}10`, color: DEEP_NAVY }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingRows.map((r, idx) => (
                        <tr key={r.area} style={{ backgroundColor: idx % 2 === 0 ? `${ACCENT_COLORS.lightBlue}05` : "#fff" }}>
                          <td style={{ padding: "14px", color: DEEP_NAVY }}>{r.type}</td>
                          <td style={{ padding: "14px", color: ACCENT_COLORS.teal }}>{r.area}</td>
                          <td style={{ padding: "14px", color: ACCENT_COLORS.burgundy, fontWeight: "bold" }}>{r.price}</td>
                          <td style={{ padding: "14px" }}>
                            <button
                              onClick={() => openLead("generic")}
                              style={{
                                backgroundColor: ACCENT_COLORS.mediumBlue,
                                color: "#fff",
                                border: "none",
                                padding: "8px 14px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: 800,
                                fontSize: 14,
                              }}
                            >
                              Price Breakup
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <div
                  style={{
                    marginTop: 14,
                    background: `${ACCENT_COLORS.teal}08`,
                    border: `1px solid ${ACCENT_COLORS.teal}30`,
                    borderRadius: 10,
                    padding: 12,
                    color: DEEP_NAVY,
                    fontSize: 13.5,
                    lineHeight: 1.6,
                  }}
                >
                  <b style={{ color: ACCENT_COLORS.teal }}>Offer:</b> Pay Just <b>10%</b> Now & Enjoy <b>NO EMI</b> Till Possession • <b>10:90</b> / Flexi payment options available.
                </div>

                <div
                  style={{
                    marginTop: 18,
                    padding: isMobile ? "18px 15px" : "20px 22px",
                    background: "#fff",
                    border: `1px solid ${ACCENT_COLORS.teal}30`,
                    borderRadius: 12,
                    boxShadow: "0 8px 22px rgba(10,31,68,0.06)",
                    textAlign: "center",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: DEEP_NAVY,
                      fontSize: isMobile ? 19 : 22,
                      lineHeight: 1.35,
                      fontWeight: 900,
                    }}
                  >
                    Sanskriti Floor Plans (3 BHK Villa Floors)
                  </h3>
                  <p
                    style={{
                      maxWidth: 760,
                      margin: "10px auto 0",
                      color: "#4A5568",
                      fontSize: isMobile ? 13.5 : 14.5,
                      lineHeight: 1.7,
                    }}
                  >
                    Floor plans are available in the brochure. Submit your details to receive the brochure instantly.
                  </p>
                  <button
                    type="button"
                    onClick={() => openLead("brochure")}
                    style={{
                      marginTop: 16,
                      minWidth: isMobile ? "100%" : 210,
                      padding: isMobile ? "12px 18px" : "12px 24px",
                      background: `linear-gradient(90deg, ${DEEP_NAVY}, ${ACCENT_COLORS.teal})`,
                      color: "#fff",
                      border: "none",
                      borderRadius: 9,
                      fontWeight: 900,
                      cursor: "pointer",
                      fontSize: isMobile ? 14 : 15,
                    }}
                  >
                    Download Brochure
                  </button>
                </div>
              </div>

              <div
                style={{
                  flex: isMobile || isTablet ? "none" : 1,
                  minWidth: isMobile || isTablet ? "auto" : "260px",
                  width: isMobile || isTablet ? "100%" : "auto",
                  border: `1px solid ${ACCENT_COLORS.teal}30`,
                  borderRadius: "6px",
                  padding: isMobile || isTablet ? "14px" : "16px",
                  textAlign: "center",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                  backgroundColor: "#fff",
                }}
              >
                <img
                  src="/g1.jpeg"
                  alt="Sanskriti"
                  style={{
                    width: "100%",
                    border: `1px solid ${ACCENT_COLORS.teal}30`,
                    marginBottom: isMobile || isTablet ? "12px" : "16px",
                    borderRadius: 10,
                  }}
                />

                <button
                  onClick={() => openLead("brochure")}
                  style={{
                    width: "100%",
                    background: `linear-gradient(90deg, ${DEEP_NAVY}, ${ACCENT_COLORS.teal})`,
                    color: "#fff",
                    border: "none",
                    padding: isMobile || isTablet ? "12px" : "14px",
                    borderRadius: "10px",
                    fontSize: isMobile || isTablet ? "14px" : "16px",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Download Brochure
                </button>

                <div style={{ marginTop: 10, fontSize: 12.5, color: ACCENT_COLORS.teal, lineHeight: 1.5 }}>
                  For detailed costing / payment plan, submit your details and we will share it on call / WhatsApp.
                </div>
              </div>
            </div>
          </section>

          
          <section
            id="site-plan"
            className="section-pad"
            style={{
              padding: isMobile || isTablet ? "30px 20px" : "60px 50px",
              backgroundColor: "#fff",
            }}
          >
            <h2
              style={{
                color: DEEP_NAVY,
                fontSize: isMobile || isTablet ? "24px" : "28px",
                textAlign: "left",
                marginBottom: isMobile || isTablet ? "20px" : "30px",
                marginTop: 0,
                fontWeight: 800,
              }}
            >
              Sanskriti Master Plan & Floor Plans
            </h2>

            <div
              style={{
                border: `1px solid ${ACCENT_COLORS.teal}30`,
                borderRadius: "12px",
                padding: isMobile || isTablet ? "10px" : "14px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                backgroundColor: `${ACCENT_COLORS.lightBlue}05`,
                overflow: "hidden",
                maxWidth: "100%",
                margin: "0 auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  animation: "masterScroll 25s linear infinite",
                  width: "max-content",
                }}
              >
                {["/plan1.png", "/plan2.png", "/plan3.png", "/plan4.png", "/plan5.png", "/plan6.png"].map((src, index) => (
                  <div
                    key={index}
                    style={{
                      minWidth: isMobile || isTablet ? "80vw" : "420px",
                      height: "260px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      backgroundColor: "#fff",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                      flexShrink: 0,
                      border: `1px solid ${ACCENT_COLORS.teal}20`,
                    }}
                  >
                    <img
                      src={src}
                      alt={`Master Plan ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: "26px", display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => openLead("masterplan")}
                style={{
                  background: `linear-gradient(90deg, ${DEEP_NAVY}, ${ACCENT_COLORS.mediumBlue})`,
                  color: "#fff",
                  border: "none",
                  padding: isMobile || isTablet ? "12px 22px" : "14px 30px",
                  borderRadius: "10px",
                  fontWeight: 900,
                  fontSize: isMobile || isTablet ? "14px" : "15px",
                  cursor: "pointer",
                }}
              >
                Request Masterplan
              </button>

              <button
                onClick={() => openLead("brochure")}
                style={{
                  background: `linear-gradient(90deg, ${DEEP_NAVY}, ${ACCENT_COLORS.teal})`,
                  color: "#fff",
                  border: "none",
                  padding: isMobile || isTablet ? "12px 22px" : "14px 30px",
                  borderRadius: "10px",
                  fontWeight: 900,
                  fontSize: isMobile || isTablet ? "14px" : "15px",
                  cursor: "pointer",
                }}
              >
                View Floor Plans in Brochure
              </button>
            </div>

            <style>
              {`
                @keyframes masterScroll {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
              `}
            </style>
          </section>

          
          <section id="amenities" style={{ padding: isMobile || isTablet ? "30px 20px" : "60px 50px", backgroundColor: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <h2 style={{ color: DEEP_NAVY, fontSize: isMobile || isTablet ? "22px" : "26px", margin: 0, fontWeight: 900 }}>
                Amenities Of Sanskriti
              </h2>
              <button
                onClick={() => openLead("generic")}
                style={{
                  background: ACCENT_COLORS.mediumBlue,
                  color: "#fff",
                  border: 0,
                  padding: isMobile || isTablet ? "8px 16px" : "10px 20px",
                  borderRadius: 10,
                  fontSize: isMobile || isTablet ? "14px" : "16px",
                  fontWeight: 900,
                }}
              >
                Amenities
              </button>
            </div>

            <div style={{ overflow: "hidden", width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  gap: isMobile || isTablet ? "16px" : "24px",
                  animation: "scrollX 30s linear infinite",
                  width: "max-content",
                  padding: isMobile || isTablet ? "10px 0" : "20px 0",
                }}
              >
                {[...amenitiesData, ...amenitiesData].map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setPreviewImg(item.img)}
                    style={{
                      width: isMobile ? 280 : isTablet ? 300 : 340,
                      height: isMobile ? 180 : isTablet ? 200 : 220,
                      borderRadius: 16,
                      overflow: "hidden",
                      position: "relative",
                      cursor: "pointer",
                      boxShadow: `0 8px 20px ${DEEP_NAVY}20`,
                      flexShrink: 0,
                      border: `2px solid ${ACCENT_COLORS.teal}30`,
                    }}
                  >
                    <img src={item.img} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 12,
                        left: 12,
                        background: DEEP_NAVY,
                        color: "#fff",
                        padding: "6px 12px",
                        fontSize: isMobile ? "11px" : "12px",
                        fontWeight: 900,
                        borderLeft: `4px solid ${ACCENT_COLORS.teal}`,
                      }}
                    >
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          
          <section id="gallery" style={{ padding: isMobile || isTablet ? "30px 20px" : "60px 50px", backgroundColor: `${ACCENT_COLORS.lightBlue}05` }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <h2 style={{ color: DEEP_NAVY, fontSize: isMobile || isTablet ? "22px" : "26px", margin: 0, fontWeight: 900 }}>
                Gallery Of Sanskriti
              </h2>
              <button
                onClick={() => openLead("generic")}
                style={{
                  background: ACCENT_COLORS.mediumBlue,
                  color: "#fff",
                  border: 0,
                  padding: isMobile || isTablet ? "8px 16px" : "10px 20px",
                  borderRadius: 10,
                  fontSize: isMobile || isTablet ? "14px" : "16px",
                  fontWeight: 900,
                }}
              >
                Gallery
              </button>
            </div>

            <div style={{ overflow: "hidden", width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  gap: isMobile || isTablet ? "16px" : "24px",
                  animation: "scrollX 25s linear infinite",
                  width: "max-content",
                  padding: isMobile || isTablet ? "10px 0" : "20px 0",
                }}
              >
                {[...galleryData, ...galleryData].map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    onClick={() => setPreviewImg(img)}
                    style={{
                      width: isMobile ? 280 : isTablet ? 300 : 340,
                      height: isMobile ? 180 : isTablet ? 200 : 220,
                      objectFit: "cover",
                      borderRadius: 16,
                      cursor: "pointer",
                      boxShadow: `0 8px 20px ${DEEP_NAVY}20`,
                      flexShrink: 0,
                      border: `2px solid ${ACCENT_COLORS.teal}30`,
                    }}
                    alt={`Gallery ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>

          
          <section
            id="location"
            className="section-pad"
            style={{
              padding: isMobile || isTablet ? "30px 20px" : "60px 50px",
              backgroundColor: "#fff",
              borderTop: `1px solid ${ACCENT_COLORS.teal}30`,
              fontFamily: "'Poppins', 'Segoe UI', sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: isMobile || isTablet ? "20px" : "30px",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ color: DEEP_NAVY, fontSize: isMobile || isTablet ? "22px" : "28px", margin: 0, fontWeight: 900 }}>
                Location Map & Prime Connectivity
              </h2>

              <button
                onClick={() => openLead("generic")}
                style={{
                  background: `linear-gradient(90deg, ${DEEP_NAVY}, ${ACCENT_COLORS.mediumBlue})`,
                  color: "#fff",
                  border: "none",
                  padding: isMobile || isTablet ? "10px 20px" : "12px 28px",
                  borderRadius: "10px",
                  fontSize: isMobile || isTablet ? "14px" : "14px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Get Directions
              </button>
            </div>

            <div
              style={{
                display: "flex",
                gap: isMobile || isTablet ? "20px" : "50px",
                flexDirection: isMobile || isTablet ? "column" : "row",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: isMobile || isTablet ? "100%" : "46%",
                  minWidth: isMobile || isTablet ? "auto" : "320px",
                  border: `1px solid ${ACCENT_COLORS.teal}30`,
                  borderRadius: "12px",
                  padding: isMobile || isTablet ? "8px" : "10px",
                  backgroundColor: `${ACCENT_COLORS.lightBlue}05`,
                }}
              >
                <img src="/location.png" alt="Location Map" style={{ width: "100%", height: "auto", display: "block", borderRadius: 10 }} />
              </div>

              <div style={{ flex: 1, width: isMobile || isTablet ? "100%" : "auto" }}>
                {[
                  ["Borivali Railway Station", "10 min"],
                  ["Borivali East Metro Station", "10 min"],
                  ["Western Express Highway", "2 min"],
                  ["Jain Derasar", "5 mins walk"],
                  ["Swaminarayan Temple", "200 m"],
                  ["Oberoi Sky City Mall", "10 min "],
                ].map(([t, v], idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: isMobile || isTablet ? "12px 0" : "14px 0",
                      borderBottom: idx < 5 ? `1px solid ${ACCENT_COLORS.teal}20` : "none",
                      fontSize: isMobile || isTablet ? "14px" : "16px",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "10px", color: DEEP_NAVY }}>
                      <span style={{ color: ACCENT_COLORS.teal, fontSize: isMobile || isTablet ? "16px" : "18px" }}>📍</span>
                      {t}
                    </span>
                    <strong style={{ color: ACCENT_COLORS.teal }}>{v}</strong>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    borderRadius: 12,
                    background: `${ACCENT_COLORS.teal}08`,
                    border: `1px solid ${ACCENT_COLORS.teal}30`,
                    color: DEEP_NAVY,
                    lineHeight: 1.6,
                    fontSize: isMobile ? 13.5 : 14.5,
                  }}
                >
                  <b style={{ color: ACCENT_COLORS.teal }}>Site Address:</b> Sanskriti Building Plot 210, Daulat Nagar Road No. 10, Borivali East, Mumbai 400066
                </div>
              </div>
            </div>
          </section>

          
          <section
            id="virtual-visit"
            style={{
              padding: isMobile || isTablet ? "30px 20px" : "50px 50px",
              backgroundColor: `${ACCENT_COLORS.teal}05`,
              borderTop: `1px solid ${ACCENT_COLORS.teal}30`,
              fontFamily: "'Poppins', 'Segoe UI', sans-serif",
            }}
          >
            <div style={{ marginBottom: isMobile || isTablet ? "20px" : "24px", textAlign: "center" }}>
              <h2 style={{ color: DEEP_NAVY, fontSize: isMobile || isTablet ? "22px" : "28px", margin: 0, fontWeight: 900, textAlign: "center" }}>
                Virtual Site Visit
              </h2>
            </div>

            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "1000px",
                height: isMobile || isTablet ? "250px" : "420px",
                margin: "0 auto",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: `0 8px 24px ${DEEP_NAVY}30`,
              }}
            >
              <img src="/g7.jpeg" alt="Virtual Site Visit" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: `${DEEP_NAVY}70`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  color: "#fff",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowVideo(true)}
                  aria-label="Play virtual site visit"
                  style={{
                    width: isMobile || isTablet ? "60px" : "80px",
                    height: isMobile || isTablet ? "60px" : "80px",
                    backgroundColor: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: isMobile || isTablet ? "12px" : "18px",
                    boxShadow: `0 0 22px ${ACCENT_COLORS.teal}60`,
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <span
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: isMobile || isTablet ? "10px solid transparent" : "14px solid transparent",
                      borderBottom: isMobile || isTablet ? "10px solid transparent" : "14px solid transparent",
                      borderLeft: isMobile || isTablet ? `18px solid ${DEEP_NAVY}` : `26px solid ${DEEP_NAVY}`,
                      marginLeft: "5px",
                    }}
                  />
                </button>

                <h3 style={{ fontSize: isMobile || isTablet ? "20px" : "32px", margin: "0 0 6px 0", fontWeight: 900, lineHeight: "1.2" }}>
                  VIRTUAL SITE VISIT
                </h3>
                <p style={{ fontSize: isMobile || isTablet ? "14px" : "18px", margin: 0 }}>{PROJECT_NAME}</p>
              </div>
            </div>

            {showVideo && (
              <div
                onClick={() => setShowVideo(false)}
                style={{
                  position: "fixed",
                  inset: 0,
                  background: `${DEEP_NAVY}95`,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 9999,
                  padding: isMobile || isTablet ? "10px" : "20px",
                }}
              >
                <video
                  controls
                  autoPlay
                  style={{
                    width: "100%",
                    maxWidth: "900px",
                    borderRadius: "12px",
                    boxShadow: `0 20px 50px ${DEEP_NAVY}60`,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <source src={HERO_VIDEO_URL} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </section>

          
          <section
            style={{
              padding: isMobile || isTablet ? "28px 16px 22px" : "36px 50px 24px",
              backgroundColor: "#fff",
              borderTop: `1px solid ${ACCENT_COLORS.teal}30`,
              fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: isMobile || isTablet ? "18px" : "22px",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ color: DEEP_NAVY, fontSize: isMobile || isTablet ? "22px" : "28px", margin: 0, fontWeight: 900 }}>
                About Jem World Group
              </h2>

              <button
                onClick={() => {
                  const message = "Hi, I am interested in Sanskriti by Jem World Group, Borivali East. Please share price, availability & site visit details. Thanks.";
                  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
                  window.open(url, "_blank");
                }}
                style={{
                  background: `linear-gradient(90deg, ${DEEP_NAVY}, ${ACCENT_COLORS.teal})`,
                  color: "#fff",
                  border: "none",
                  padding: isMobile || isTablet ? "9px 18px" : "10px 24px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Chat with us
              </button>
            </div>

            <div style={{ color: DEEP_NAVY, lineHeight: "1.65", fontSize: isMobile || isTablet ? "14px" : "15px", width: "100%" }}>
              <p style={{ margin: "0 0 14px", textAlign: isMobile ? "left" : "justify" }}>
                {PROJECT_NAME} is a distinguished residential development by{" "}
                <span style={{ color: ACCENT_COLORS.teal, fontWeight: "bold" }}>Jem World Group</span>, backed by a legacy of trust built over 54+ years. Rooted in thoughtful planning and uncompromising quality, the project is designed to offer privacy, comfort, and refined living. Featuring spacious, Vastu-compliant homes with well-ventilated layouts, {PROJECT_NAME} seamlessly blends modern design with everyday convenience, ensuring excellent connectivity and a superior lifestyle experience.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile || isTablet ? "1fr" : "minmax(300px, 0.8fr) minmax(520px, 1.2fr)",
                  gap: isMobile || isTablet ? "12px" : "0",
                  marginBottom: "14px",
                  backgroundColor: `${ACCENT_COLORS.lightBlue}05`,
                  border: `1px solid ${ACCENT_COLORS.teal}30`,
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: isMobile || isTablet ? "14px" : "16px 20px",
                    borderRight: !isMobile && !isTablet ? `1px solid ${ACCENT_COLORS.teal}25` : "none",
                    borderBottom: isMobile || isTablet ? `1px solid ${ACCENT_COLORS.teal}25` : "none",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 900, color: DEEP_NAVY, fontSize: isMobile ? "14px" : "15px" }}>{PROJECT_NAME}</p>
                  <p style={{ margin: 0, color: ACCENT_COLORS.teal }}>
                    MahaRERA – <strong style={{ color: ACCENT_COLORS.burgundy }}>P51800011430</strong>
                  </p>
                  <p style={{ margin: 0, color: ACCENT_COLORS.teal }}>
                    Possession – <strong style={{ color: ACCENT_COLORS.burgundy }}>June 2027</strong>
                  </p>
                </div>

                <div
                  style={{
                    padding: isMobile || isTablet ? "14px" : "16px 20px",
                    display: "grid",
                    gap: "8px",
                    alignContent: "center",
                    color: DEEP_NAVY,
                    fontSize: isMobile ? "13px" : "14px",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "108px 1fr", gap: "6px 8px", alignItems: "start" }}>
                    <strong style={{ color: ACCENT_COLORS.teal }}>✓ Site Address:</strong>
                    <span>Sanskriti Building Plot 210, Daulat Nagar Road No. 10, Borivali East, Mumbai 400066</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "108px 1fr", gap: "6px 8px", alignItems: "start" }}>
                    <strong style={{ color: ACCENT_COLORS.teal }}>✓ Contact Us:</strong>
                    <span>{PHONE}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "108px 1fr", gap: "6px 8px", alignItems: "start" }}>
                    <strong style={{ color: ACCENT_COLORS.teal }}>✓ Email Id:</strong>
                    <a href={`mailto:${EMAIL}`} style={{ color: DEEP_NAVY, textDecoration: "none" }}>{EMAIL}</a>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: isMobile || isTablet ? "12px" : "13px", color: ACCENT_COLORS.teal, margin: "0 0 16px" }}>
                The promoter shall execute and register a conveyance deed in favour of the allottee / association of allottees as per applicable rules.
              </p>
            </div>

            <footer
              style={{
                padding: isMobile || isTablet ? "14px 0 4px" : "16px 0 2px",
                borderTop: `1px solid ${ACCENT_COLORS.teal}30`,
                fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
              }}
            >
              <div style={{ fontSize: isMobile || isTablet ? "12px" : "13px", color: ACCENT_COLORS.teal, lineHeight: "1.6", marginBottom: "12px" }}>
                <p style={{ margin: 0 }}>
                  <strong style={{ color: DEEP_NAVY }}>Disclaimer: </strong>This is authorised website of developer.
                </p>
              </div>

              <div
                style={{
                  textAlign: "center",
                  fontSize: isMobile || isTablet ? "12px" : "14px",
                  color: DEEP_NAVY,
                  borderTop: `1px solid ${ACCENT_COLORS.teal}25`,
                  paddingTop: "12px",
                }}
              >
                <p style={{ margin: 0 }}>
                  © 2026 Sanskriti |
                  <a href="#" style={{ color: ACCENT_COLORS.mediumBlue, textDecoration: "none", margin: "0 6px" }}>
                    Terms & Conditions
                  </a>
                  |
                  <a href="#" style={{ color: ACCENT_COLORS.mediumBlue, textDecoration: "none", margin: "0 6px" }}>
                    Privacy Policy
                  </a>
                  |
                  <a href="#" style={{ color: ACCENT_COLORS.mediumBlue, textDecoration: "none", margin: "0 6px" }}>
                    Cookies Policy
                  </a>
                </p>
              </div>
            </footer>
          </section>
        </div>

        
        {!isMobile && !isTablet && !heroVideoActive && (
          <aside
            className="right-pane"
            style={{
              width: rightSectionWidth,
              height: "100%",
              borderLeft: `1px solid ${ACCENT_COLORS.teal}30`,
              display: "flex",
              flexDirection: "column",
              padding: "20px 15px",
              boxSizing: "border-box",
              backgroundColor: `${ACCENT_COLORS.lightBlue}03`,
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => openLead("callback")}
              style={{
                backgroundColor: ACCENT_COLORS.teal,
                color: "#fff",
                border: "none",
                padding: "12px",
                width: "100%",
                borderRadius: "10px",
                fontWeight: 900,
                marginBottom: "18px",
                cursor: "pointer",
                boxShadow: `0 10px 18px ${ACCENT_COLORS.teal}30`,
              }}
            >
              📞 Instant Call Back
            </button>

            <EnquiryBlock />

            <div style={{ marginTop: "auto", textAlign: "center", paddingTop: "18px", paddingBottom: "10px" }}>
              <div style={{ fontSize: "24px", color: DEEP_NAVY }}>📄</div>
              <p style={{ fontSize: "11px", fontWeight: 900, margin: "8px 0 0 0", lineHeight: 1.2, color: DEEP_NAVY }}>
                Download <br /> Brochure
              </p>

              <button
                onClick={() => openLead("brochure")}
                style={{
                  marginTop: 10,
                  background: "#fff",
                  border: `1px solid ${DEEP_NAVY}40`,
                  padding: "10px 12px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 900,
                  color: DEEP_NAVY,
                }}
              >
                Open Brochure
              </button>
            </div>
          </aside>
        )}
      </div>

      
      {!isMobile && !isTablet && (
        <div
          aria-label="Quick contact actions"
          style={{
            position: "fixed",
            right: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 9800,
            width: "118px",
            display: "flex",
            flexDirection: "column",
            gap: "7px",
            filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.18))",
          }}
        >
          <button
            type="button"
            onClick={() => openLead("callback")}
            aria-label="Enquire now"
            style={{
              height: "58px",
              width: "100%",
              border: "none",
              background: ACCENT_COLORS.teal,
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              boxSizing: "border-box",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 5.5h16v11H8l-4 3v-14Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <span>Enquire</span>
          </button>

          <a
            href={`tel:${PHONE_PRIMARY}`}
            aria-label="Call now"
            style={{
              height: "58px",
              width: "100%",
              background: DEEP_NAVY,
              color: "#fff",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
              boxSizing: "border-box",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7.2 3.5 10 7.1 8.4 9.4c1.1 2.3 2.9 4.1 5.2 5.2l2.3-1.6 3.6 2.8c.5.4.7 1 .5 1.6l-.5 2c-.2.8-.9 1.4-1.7 1.5-1 .1-2 .1-2.9-.2-6.2-1.7-11-6.5-12.7-12.7-.3-1-.3-2-.2-2.9.1-.8.7-1.5 1.5-1.7l2-.5c.6-.2 1.3 0 1.7.6Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            <span>Call</span>
          </a>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_TEXT}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            style={{
              height: "58px",
              width: "100%",
              background: ACCENT_COLORS.darkTeal,
              color: "#fff",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              fontSize: "10px",
              fontWeight: 800,
              letterSpacing: "0.35px",
              textTransform: "uppercase",
              boxSizing: "border-box",
            }}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L4 20l1.1-4a8.2 8.2 0 1 1 15.1-4.3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M9 8.2c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.3 0 .5-.1.7l-.6.7c-.2.2-.1.4 0 .6.5.9 1.2 1.6 2.1 2.1.2.1.4.2.6 0l.8-1c.2-.2.4-.3.7-.2l1.7.8c.3.1.4.3.4.5 0 .5-.2 1.4-.6 1.8-.5.5-1.3.8-2.1.7-1.1-.1-2.5-.6-4.2-2.1-2-1.7-3.2-3.9-3.3-5 0-.5.1-.9.2-1.3Z" fill="currentColor" />
            </svg>
            <span>WhatsApp</span>
          </a>
        </div>
      )}

      
      {isMobile && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: "#fff",
            borderTop: `1px solid ${ACCENT_COLORS.teal}30`,
            padding: "10px 10px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            boxShadow: `0 -14px 30px ${DEEP_NAVY}15`,
          }}
        >
          <a
            href={`tel:${PHONE}`}
            style={{
              textDecoration: "none",
              background: `linear-gradient(135deg, ${DEEP_NAVY}, ${ACCENT_COLORS.mediumBlue})`,
              color: "#fff",
              fontWeight: 900,
              fontSize: 14,
              padding: "12px 10px",
              borderRadius: 12,
              textAlign: "center",
            }}
          >
            Call
          </a>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_TEXT}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              textDecoration: "none",
              background: `linear-gradient(135deg, ${DEEP_NAVY}, ${ACCENT_COLORS.teal})`,
              color: "#fff",
              fontWeight: 900,
              fontSize: 14,
              padding: "12px 10px",
              borderRadius: 12,
              textAlign: "center",
            }}
          >
            WhatsApp
          </a>

          <button
            onClick={() => openLead("callback")}
            style={{
              background: `linear-gradient(135deg, ${DEEP_NAVY}, ${ACCENT_COLORS.teal})`,
              color: "#fff",
              border: "none",
              fontWeight: 900,
              fontSize: 14,
              padding: "12px 10px",
              borderRadius: 12,
              cursor: "pointer",
            }}
          >
            Enquire Now
          </button>
        </div>
      )}

      
      {previewImg && (
        <div
          onClick={() => setPreviewImg(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: `${DEEP_NAVY}95`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            cursor: "zoom-out",
            padding: isMobile || isTablet ? "10px" : "20px",
          }}
        >
          <img
            src={previewImg}
            alt="Preview"
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              borderRadius: "12px",
              boxShadow: `0 20px 60px ${DEEP_NAVY}60`,
              border: `2px solid ${ACCENT_COLORS.teal}`,
            }}
          />
        </div>
      )}

      
      {showLeadModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: `${DEEP_NAVY}80`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: isMobile || isTablet ? "10px" : "20px",
          }}
        >
          <div
            style={{
              width: isMobile || isTablet ? "100%" : "720px",
              maxWidth: "95%",
              background: "#fff",
              borderRadius: "6px",
              overflow: "hidden",
              position: "relative",
              border: `2px solid ${ACCENT_COLORS.teal}`,
            }}
          >
            <span
              onClick={() => setShowLeadModal(false)}
              style={{
                position: "absolute",
                right: 14,
                top: 10,
                fontSize: 22,
                cursor: "pointer",
                fontWeight: "bold",
                color: DEEP_NAVY,
              }}
            >
              ×
            </span>

            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <div
                style={{
                  width: isMobile || isTablet ? "100%" : "35%",
                  minWidth: "240px",
                  background: `${ACCENT_COLORS.teal}08`,
                  padding: "30px 20px",
                }}
              >
                <h3 style={{ color: DEEP_NAVY, marginBottom: 20, fontWeight: 900 }}>We Promise</h3>

                {["Instant Call Back", "Free Site Visit", "Best Offers"].map((text) => (
                  <div
                    key={text}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 18,
                      color: DEEP_NAVY,
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: `${ACCENT_COLORS.teal}20`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                        color: ACCENT_COLORS.teal,
                      }}
                    >
                      ✓
                    </span>
                    {text}
                  </div>
                ))}
              </div>

              <div style={{ flex: 1, padding: "30px 30px" }}>
                <h3 style={{ marginBottom: 10, fontWeight: 900, color: DEEP_NAVY }}>
                  Register Here And Avail The <span style={{ color: ACCENT_COLORS.teal }}>Best Offers!!</span>
                </h3>
                <div style={{ marginBottom: 18, color: ACCENT_COLORS.teal, fontSize: 13.5, lineHeight: 1.5 }}>
                  {leadAction === "brochure" ? "Brochure will download after submit." : "We will contact you shortly."}
                </div>

                {done ? (
                  <div
                    style={{
                      display: "inline-block",
                      marginBottom: 14,
                      padding: "6px 10px",
                      fontSize: 12,
                      borderRadius: 999,
                      background: `${ACCENT_COLORS.teal}15`,
                      border: `1px solid ${ACCENT_COLORS.teal}40`,
                      color: ACCENT_COLORS.teal,
                      fontWeight: 800,
                    }}
                  >
                    Submitted ✓
                  </div>
                ) : null}

                {errorText ? (
                  <div style={{ marginBottom: 12, fontSize: 12, color: "#b00020", fontWeight: 700 }}>
                    {errorText}
                  </div>
                ) : null}

                <input
                  placeholder="Name"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  style={{ ...inputStyle, borderBottom: `1px solid ${ACCENT_COLORS.teal}50` }}
                />

                <input
                  placeholder="Email Address (Optional)"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  style={{ ...inputStyle, borderBottom: `1px solid ${ACCENT_COLORS.teal}50` }}
                />

                <div style={{ display: "flex", gap: 10 }}>
                  <select style={{ ...inputStyle, marginBottom: 16, width: 140, flex: "0 0 140px", borderBottom: `1px solid ${ACCENT_COLORS.teal}50` }}>
                    <option>India (+91)</option>
                    <option>UK (+44)</option>
                    <option>USA (+1)</option>
                    <option>UAE (+971)</option>
                    <option>Singapore (+65)</option>
                    <option>Canada (+1)</option>
                    <option>Australia (+61)</option>
                  </select>

                  <input
                    placeholder="Phone number"
                    value={form.mobile}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        mobile: e.target.value.replace(/[^0-9\s]/g, ""),
                      }))
                    }
                    style={{ ...inputStyle, borderBottom: `1px solid ${ACCENT_COLORS.teal}50`, flex: 1 }}
                  />
                </div>

                <button
                  disabled={!isValid || loading}
                  onClick={() => submitEnquiry({ autoCloseModal: true, downloadAfter: leadAction })}
                  style={{
                    marginTop: 10,
                    width: "100%",
                    padding: "14px",
                    background: `linear-gradient(90deg, ${DEEP_NAVY}, ${ACCENT_COLORS.teal})`,
                    color: "#fff",
                    border: "none",
                    borderRadius: 6,
                    fontWeight: 900,
                    cursor: !isValid || loading ? "not-allowed" : "pointer",
                    fontSize: 16,
                    opacity: !isValid || loading ? 0.7 : 1,
                  }}
                >
                  {loading ? "Submitting..." : "Get Instant Call Back"}
                </button>
              </div>
            </div>

            <div
              style={{
                background: DEEP_NAVY,
                color: "#fff",
                padding: "14px",
                textAlign: "center",
                fontWeight: 900,
                fontSize: 16,
              }}
            >
              📞 {PHONE}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
