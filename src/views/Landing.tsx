// src/views/LandingPage.tsx
import React, { useMemo, useEffect, useRef, useState } from "react";
import { postEnquiry } from "../api";

// ==========================================
// 1) PROJECT CONFIG (UPDATED AS PER YOUR CONTENT + PDFs)
// ==========================================
const PROJECT_NAME = "Sanskriti by Jem World Group";
const PROJECT_SUB = "Exclusive 3 BHK Villa Floors • One Floor, One Apartment";
const LOCATION_LINE = "Daulat Nagar, Borivali East, Mumbai 400066";

// Hero slider images (your existing)
const IMAGE_PATHS: string[] = ["/back1.jpeg", "/g7.jpeg", "/back3.jpeg", "/g6.jpeg"];

// Amenities / Gallery (your existing)
const amenitiesData = [
  { title: "Looby", img: "/g1.jpeg" },
  { title: "GYM", img: "/g2.jpeg" },
 
  { title: "Powder Washroom", img: "/powderwashroom.jpeg" },
  { title: "Open View", img: "/g3.jpeg" },
  { title: "Bedroom", img: "/Bedroom.jpeg" },
  { title: "Lift", img: "/lift.jpeg" },
];

const galleryData = ["/g1.jpeg", "/g3.jpeg", "/g2.jpeg", "/g4.jpeg", "/g6.jpeg", "/g5.jpeg"];

// ✅ Put brochure in /public as brochure.pdf
const BROCHURE_URL = "/brochure.pdf"; // FIXED

// (Optional) if you have these PDFs later, put them in /public and update:
const MASTERPLAN_URL = ""; // e.g. "/masterplan.pdf"
const COSTING_URL = ""; // e.g. "/price-sheet.pdf"

// ✅ update these if needed
const PHONE = "+919004183975";
const WHATSAPP_NUMBER = "9004183975"; // without +
const WHATSAPP_TEXT = encodeURIComponent(`Hi, I want details for ${PROJECT_NAME}.`);

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
  const [expanded, setExpanded] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // lead modal + action
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadAction, setLeadAction] = useState<LeadAction>("generic");

  // enquiry state
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [form, setForm] = useState({ name: "", mobile: "", email: "" });

  // responsive helpers
  const [isMobile, setIsMobile] = useState(false); // <=768
  const [isTablet, setIsTablet] = useState(false); // 769-1024

  // refs
  const leadOpenRef = useRef(showLeadModal);
  const previewRef = useRef(previewImg);
  const videoRef = useRef(showVideo);
  const loadingRef = useRef(loading);
  const lastInteractRef = useRef(Date.now());

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

  // detect responsive breakpoints
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

  // hero slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % IMAGE_PATHS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const mobile10 = useMemo(
    () => form.mobile.replace(/\s/g, "").replace(/[^0-9]/g, ""),
    [form.mobile]
  );

  // Email optional, but if filled must be valid
  const isValid = useMemo(() => {
    const nameOk = form.name.trim().length >= 2;
    const mobileOk = /^\d{10}$/.test(mobile10);
    const email = form.email.trim();
    const emailOk = email.length === 0 ? true : /.+@.+\..+/.test(email);
    return nameOk && mobileOk && emailOk;
  }, [form.name, form.email, mobile10]);

  function openLead(action: LeadAction) {
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
        email: form.email.trim(), // can be ""
      });

      setDone(true);
      setForm({ name: "", mobile: "", email: "" });

      const action = opts?.downloadAfter ?? leadAction;

      // ✅ Download after successful submit (fixed)
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

  // interaction tracker (for "idle" auto popup)
  useEffect(() => {
    const bump = () => (lastInteractRef.current = Date.now());
    window.addEventListener("scroll", bump, { passive: true });
    window.addEventListener("touchstart", bump, { passive: true });
    window.addEventListener("mousemove", bump);
    window.addEventListener("keydown", bump);
    window.addEventListener("click", bump);
    return () => {
      window.removeEventListener("scroll", bump);
      window.removeEventListener("touchstart", bump);
      window.removeEventListener("mousemove", bump);
      window.removeEventListener("keydown", bump);
      window.removeEventListener("click", bump);
    };
  }, []);

  // AUTO open modal every 5s, only when idle + not blocking
  useEffect(() => {
    const id = window.setInterval(() => {
      if (leadOpenRef.current) return;
      if (previewRef.current) return;
      if (videoRef.current) return;
      if (loadingRef.current) return;

      // only if idle ~4.5s+
      if (Date.now() - lastInteractRef.current < 4500) return;

      openLead("callback");
    }, 5000);

    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // scroll helper
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

  // reusable enquiry block (same fields)
  const EnquiryBlock = ({ compact }: { compact?: boolean }) => (
    <div
      style={{
        width: "100%",
        background: "#fff",
        border: compact ? "1px solid #eee" : "none",
        borderRadius: compact ? 12 : 0,
        padding: compact ? "16px 14px" : 0,
        boxShadow: compact ? "0 10px 24px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontSize: "18px", color: "#333", marginBottom: "18px", marginTop: 0 }}>
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
              background: "rgba(0, 150, 0, 0.08)",
              border: "1px solid rgba(0,150,0,0.2)",
              color: "#0a7a0a",
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
            border: "1px solid #e6e6e6",
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
            border: "1px solid #e6e6e6",
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
            border: "1px solid #e6e6e6",
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
            backgroundColor: "#a34e35",
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

  // ✅ Pricing data as per your content
  const pricingRows = [
    { type: "3 BHK Villa Floor", area: "1002 sq.ft", price: "₹ 2.80 Cr Onwards*" },
    { type: "3 BHK Villa Floor", area: "1155 sq.ft", price: "₹ 2.80 Cr Onwards*" },
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
        paddingBottom: isMobile ? 78 : 0, // ✅ mobile bottom bar space
      }}
    >
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          width: 100%;
          overflow-x: hidden;
        }

        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }

        .nav-item { transition: background .2s ease, color .2s ease; }
        .nav-item:hover { background: #fff7f2; color: #d35400; }
        .nav-item:active { transform: translateY(0.5px); }

        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #eee; padding: 12px; text-align: left; font-size: 14px; }
        th { background-color: #f8f8f8; color: #333; }
        tr:hover td { background: #fff7f2; }

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

        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* ✅ MOBILE: fixed vertical brochure tab */}
      {isMobile && (
        <button
          onClick={() => openLead("brochure")}
          style={{
            position: "fixed",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 9998,
            border: "1px solid rgba(0,0,0,0.15)",
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
              background: "#fff0e6",
              color: "#d35400",
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
              color: "#333",
              letterSpacing: 0.4,
            }}
          >
            Download Brochure
          </span>
        </button>
      )}

      {/* HEADER */}
      <header
        style={{
          height: `${headerHeight}px`,
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #ddd",
          backgroundColor: "#fff",
          zIndex: 1000,
          position: "sticky",
          top: 0,
          width: "100%",
        }}
      >
        {/* MOBILE MENU TOGGLE */}
        {(isMobile || isTablet) && (
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{
              background: "none",
              border: "none",
              fontSize: "24px",
              padding: "0 20px",
              cursor: "pointer",
              color: "#333",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "60px",
            }}
          >
            ☰
          </button>
        )}

        {/* LOGO */}
        <div style={{ width: isMobile ? "170px" : "220px", paddingLeft: isMobile ? "10px" : "20px" }}>
          <div style={{ color: "#003366", fontWeight: "bold", fontSize: isMobile ? "16px" : "20px", lineHeight: "1.1" }}>
            Sanskriti
          </div>
          <div style={{ color: "#666", fontSize: isMobile ? "9px" : "11px", letterSpacing: "2px" }}>
            {LOCATION_LINE}
          </div>
        </div>

        {/* DESKTOP NAV */}
        {!isMobile && !isTablet && (
          <nav
            className="nav-wrap"
            style={{
              display: "flex",
              height: "100%",
              flex: 1,
              alignItems: "center",
            }}
          >
            {/* HOME */}
            <div
              style={{
                backgroundColor: "#d35400",
                color: "#fff",
                padding: "0 20px",
                height: "100%",
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                flexShrink: 0,
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
                  padding: "0 12px",
                  fontSize: "12px",
                  color: "#333",
                  borderRight: "1px solid #f0f0f0",
                  cursor: "pointer",
                  flexShrink: 0,
                  fontWeight: 600,
                }}
              >
                {item.label}
              </div>
            ))}

            {/* ADMIN LOGIN */}
            <div style={{ marginLeft: "auto", paddingRight: "12px" }}>
              <a
                href="/admin"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  border: "1px solid #ddd",
                  fontSize: "12px",
                  color: "#333",
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

        {/* DESKTOP RIGHT SIDE (only for desktop) */}
        {!isMobile && !isTablet && (
          <div className="header-right" style={{ display: "flex", height: "100%", width: rightSectionWidth }}>
            <div
              onClick={() => openLead("costing")}
              style={{
                flex: 1,
                backgroundColor: "#444",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                padding: "0 10px",
                gap: "8px",
                cursor: "pointer",
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
                backgroundColor: "#222",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                padding: "0 10px",
                gap: "5px",
              }}
            >
              📞 <b style={{ fontSize: "11px" }}>{PHONE}</b>
            </div>
          </div>
        )}

        {/* MOBILE/TABLET RIGHT SIDE */}
        {(isMobile || isTablet) && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", paddingRight: "15px" }}>
            <a
              href={`tel:${PHONE}`}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: "6px",
                background: "#f0f0f0",
                color: "#333",
                textDecoration: "none",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              📞 {isMobile ? "" : "Call"}
            </a>
          </div>
        )}
      </header>

      {/* MOBILE/TABLET MENU OVERLAY */}
      {(isMobile || isTablet) && showMobileMenu && (
        <div
          style={{
            position: "fixed",
            top: headerHeight,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.95)",
            zIndex: 9999,
            animation: "fadeIn 0.3s ease",
            display: "flex",
            flexDirection: "column",
            padding: "20px",
          }}
        >
          <button
            onClick={() => setShowMobileMenu(false)}
            style={{
              position: "absolute",
              top: "10px",
              right: "20px",
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "30px",
              cursor: "pointer",
            }}
          >
            ×
          </button>

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
              background: "#d35400",
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

      {/* MAIN LAYOUT */}
      <div className="layout-wrap" style={{ display: "flex", flex: 1, overflow: isMobile || isTablet ? "visible" : "hidden" }}>
        {/* LEFT SIDE */}
        <div
          className="hide-scroll left-pane"
          style={{
            width: isMobile || isTablet ? "100%" : "78%",
            height: isMobile || isTablet ? "auto" : "100%",
            overflowY: isMobile || isTablet ? "visible" : "auto",
          }}
        >
          {/* MOBILE/TABLET HERO */}
          {(isMobile || isTablet) ? (
            <section
              id="home"
              style={{
                width: "100%",
                height: `calc(100vh - ${headerHeight}px)`,
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
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  top: 0,
                  left: 0,
                  zIndex: 1,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.42)",
                  zIndex: 2,
                }}
              />
            </section>
          ) : (
            /* DESKTOP HERO */
            <section
              className="hero-pad"
              style={{
                minHeight: `calc(100vh - ${headerHeight}px)`,
                backgroundImage: `url(${IMAGE_PATHS[currentImg]})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                padding: "30px",
              }}
            >
              <div
                style={{
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
                    backgroundColor: "#d4631c",
                    color: "#fff",
                    padding: "10px",
                    textAlign: "center",
                    fontWeight: 800,
                    fontSize: "13px",
                  }}
                >
                  70% Work Completed • Possession: Dec 2026
                </div>

                <div style={{ padding: "18px", textAlign: "center" }}>
                  <h2 style={{ fontSize: "22px", margin: "0 0 8px", fontWeight: 900, lineHeight: 1.2 }}>
                    {PROJECT_NAME}
                  </h2>

                  <div
                    style={{
                      backgroundColor: "#7b3f52",
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
                      backgroundColor: "#f2f2f2",
                      padding: "10px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      marginBottom: "14px",
                      textAlign: "left",
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
                      border: "2px dashed #d4631c",
                      backgroundColor: "#d4631c",
                      color: "#fff",
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

                  <div style={{ fontSize: "13px", color: "#555", marginBottom: "6px" }}>
                    Starting From
                  </div>

                  <div style={{ fontSize: "30px", fontWeight: 900 }}>
                    ₹ 2.80 Cr* <span style={{ fontSize: "14px", fontWeight: 600 }}>Onwards</span>
                  </div>

                  <button
                    onClick={() => openLead("brochure")}
                    style={{
                      background: "linear-gradient(90deg, #a34e35, #d4631c)",
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
            </section>
          )}

          {/* MOBILE/TABLET: CONTENT CARD AFTER HERO */}
          {(isMobile || isTablet) && (
            <div
              style={{
                padding: "20px",
                backgroundColor: "#fff",
                marginTop: "-100px",
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
                    backgroundColor: "#d4631c",
                    color: "#fff",
                    padding: "12px",
                    textAlign: "center",
                    fontWeight: 900,
                    fontSize: "14px",
                  }}
                >
                  70% Work Completed • Possession: Dec 2026
                </div>

                <div style={{ padding: "20px", textAlign: "center" }}>
                  <h2 style={{ fontSize: "20px", margin: "0 0 10px", fontWeight: 900, lineHeight: 1.2 }}>
                    {PROJECT_NAME}
                  </h2>

                  <div
                    style={{
                      backgroundColor: "#7b3f52",
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
                      backgroundColor: "#f2f2f2",
                      padding: "12px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      marginBottom: "16px",
                      textAlign: "center",
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
                      border: "2px dashed #d4631c",
                      backgroundColor: "#d4631c",
                      color: "#fff",
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

                  <div style={{ fontSize: "14px", color: "#555", marginBottom: "8px" }}>Starting From</div>

                  <div style={{ fontSize: "28px", fontWeight: 900, marginBottom: "16px" }}>
                    ₹ 2.80 Cr* <span style={{ fontSize: "14px", fontWeight: 600 }}>Onwards</span>
                  </div>

                  <button
                    onClick={() => openLead("brochure")}
                    style={{
                      background: "linear-gradient(90deg, #a34e35, #d4631c)",
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

          {/* Welcome */}
          <section
            className="section-pad"
            style={{
              padding: isMobile || isTablet ? "40px 20px" : "70px 60px",
              backgroundColor: "#fff",
              fontFamily: "'Poppins', 'Segoe UI', sans-serif",
            }}
          >
            <h2
              style={{
                color: "#d35400",
                fontSize: isMobile || isTablet ? "28px" : "38px",
                fontWeight: 800,
                marginBottom: "16px",
                marginTop: 0,
                lineHeight: 1.2,
              }}
            >
              Introducing Sanskriti – Your Own Villa Floor in Prime Borivali East
            </h2>

            <p
              style={{
                lineHeight: "1.9",
                color: "#222",
                fontSize: isMobile || isTablet ? "16px" : "18px",
                maxWidth: "1100px",
                marginTop: 0,
                marginBottom: "14px",
              }}
            >
              A landmark development by <b>Jem World Group</b> – a 3rd-generation developer known for quality, timely delivery & exceptional
              customer service. Experience an <b>exclusive 3 BHK Villa Floor concept</b> with <b>one floor, one apartment</b> in Daulat Nagar,
              Borivali East.
            </p>

            {expanded && (
              <div style={{ maxWidth: "1100px" }}>
                <p
                  style={{
                    lineHeight: "1.9",
                    color: "#222",
                    fontSize: isMobile || isTablet ? "16px" : "18px",
                    marginBottom: "14px",
                  }}
                >
                  Designed for luxury, privacy & positive energy: <b>Vastu-compliant</b> homes with a <b>3-side open layout</b>, <b>3 master bedrooms</b>,
                  powder washroom, and panoramic views towards the <b>Sanjay Gandhi National Park</b>.
                </p>

                <div
                  style={{
                    background: "#fff7f2",
                    border: "1px solid #ffd9c7",
                    borderRadius: 10,
                    padding: isMobile ? "14px" : "16px 18px",
                    marginBottom: "14px",
                  }}
                >
                  <div style={{ fontWeight: 900, color: "#a34e35", marginBottom: 10 }}>
                    Key Highlights
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      gap: "10px 18px",
                      fontSize: isMobile ? 14 : 15,
                      color: "#222",
                      lineHeight: 1.5,
                    }}
                  >
                    {[
                      "Exclusive 3 BHK layout with Villa Floor concept",
                      "Niche gentry / premium neighborhood",
                      "Freehold land (most nearby are redevelopment)",
                      "Developer’s legacy (3rd generation)",
                      "Daulat Nagar’s premium project",
                      "3-side open view",
                      "All 3 master bedrooms + powder washroom",
                      "Butterfly layout with efficient planning",
                      "Quality product & premium finishes",
                      "Connectivity to Metro Rail & Western Express Highway",
                      "Jain Derasar & Swaminarayan temple within ~200m",
                      "Non-cosmo project",
                      "No loan on project (for construction) / cash-rich developer",
                      "10:90 scheme & flexi payment options",
                      "70% work completed • Possession Dec 2026",
                    ].map((t) => (
                      <div key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: "#d35400", fontWeight: 900 }}>✓</span>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 6,
                  }}
                >
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 999,
                      background: "rgba(211,84,0,0.10)",
                      border: "1px solid rgba(211,84,0,0.22)",
                      fontWeight: 900,
                      color: "#a34e35",
                      fontSize: 13,
                    }}
                  >
                    Starting from ₹2.8 Cr Onwards*
                  </div>
                  <div
                    style={{
                      padding: "10px 12px",
                      borderRadius: 999,
                      background: "rgba(0,150,0,0.08)",
                      border: "1px solid rgba(0,150,0,0.18)",
                      fontWeight: 900,
                      color: "#0a7a0a",
                      fontSize: 13,
                    }}
                  >
                    Pay 10% Now • NO EMI till Possession
                  </div>
                </div>
              </div>
            )}

            <span
              onClick={() => setExpanded(!expanded)}
              style={{
                cursor: "pointer",
                color: "#000",
                fontWeight: 700,
                textDecoration: "underline",
                fontSize: isMobile || isTablet ? "14px" : "16px",
                display: "inline-block",
                marginBottom: "18px",
                marginTop: 6,
              }}
            >
              {expanded ? "Read less" : "Read more"}
            </span>

            <br />

            <button
              onClick={() => openLead("brochure")}
              style={{
                background: "linear-gradient(90deg, #c85c11, #e67e22)",
                color: "#fff",
                border: "none",
                padding: isMobile || isTablet ? "12px 24px" : "14px 34px",
                borderRadius: "6px",
                marginTop: "10px",
                cursor: "pointer",
                fontSize: isMobile || isTablet ? "14px" : "16px",
                fontWeight: 800,
              }}
            >
              Download Brochure
            </button>
          </section>

          {/* Pricing */}
          <section
            id="price"
            className="section-pad"
            style={{
              padding: isMobile || isTablet ? "30px 20px" : "60px 50px",
              backgroundColor: "#fdfdfd",
              fontFamily: "'Poppins', 'Segoe UI', sans-serif",
            }}
          >
            <h2
              style={{
                color: "#d35400",
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
              {/* TABLE (Desktop/Tablet) + Cards (Mobile) */}
              <div style={{ flex: isMobile || isTablet ? "none" : 2, width: "100%" }}>
                {/* ✅ MOBILE NO HORIZONTAL SCROLL: show cards instead of wide table */}
                {isMobile ? (
                  <div style={{ display: "grid", gap: 12 }}>
                    {pricingRows.map((r) => (
                      <div
                        key={r.area}
                        style={{
                          border: "1px solid #e6e6e6",
                          borderRadius: 12,
                          padding: 14,
                          background: "#fff",
                          boxShadow: "0 8px 18px rgba(0,0,0,0.08)",
                        }}
                      >
                        <div style={{ fontWeight: 900, color: "#111", fontSize: 15, marginBottom: 6 }}>{r.type}</div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 6 }}>
                          <span style={{ color: "#555" }}>Carpet</span>
                          <b>{r.area}</b>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 12 }}>
                          <span style={{ color: "#555" }}>Price</span>
                          <b style={{ color: "#a34e35" }}>{r.price}</b>
                        </div>
                        <button
                          onClick={() => openLead("generic")}
                          style={{
                            width: "100%",
                            backgroundColor: "#c85c11",
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
                  <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
                    <thead>
                      <tr>
                        <th style={{ padding: "14px", textAlign: "left", fontWeight: 800 }}>Type</th>
                        <th style={{ padding: "14px", textAlign: "left", fontWeight: 800 }}>Carpet Area</th>
                        <th style={{ padding: "14px", textAlign: "left", fontWeight: 800 }}>Price</th>
                        <th style={{ padding: "14px", textAlign: "left", fontWeight: 800 }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingRows.map((r, idx) => (
                        <tr key={r.area} style={{ backgroundColor: idx % 2 === 0 ? "#f3f3f3" : "#fff" }}>
                          <td style={{ padding: "14px" }}>{r.type}</td>
                          <td style={{ padding: "14px" }}>{r.area}</td>
                          <td style={{ padding: "14px" }}>{r.price}</td>
                          <td style={{ padding: "14px" }}>
                            <button
                              onClick={() => openLead("generic")}
                              style={{
                                backgroundColor: "#c85c11",
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
                    background: "#fff7f2",
                    border: "1px solid #ffd9c7",
                    borderRadius: 10,
                    padding: 12,
                    color: "#333",
                    fontSize: 13.5,
                    lineHeight: 1.6,
                  }}
                >
                  <b>Offer:</b> Pay Just <b>10%</b> Now & Enjoy <b>NO EMI</b> Till Possession • <b>10:90</b> / Flexi payment options available.
                </div>
              </div>

              {/* COSTING BOX */}
              <div
                style={{
                  flex: isMobile || isTablet ? "none" : 1,
                  minWidth: isMobile || isTablet ? "auto" : "260px",
                  width: isMobile || isTablet ? "100%" : "auto",
                  border: "1px solid #ddd",
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
                    border: "1px solid #ccc",
                    marginBottom: isMobile || isTablet ? "12px" : "16px",
                    borderRadius: 10,
                  }}
                />

                <button
                  onClick={() => openLead("brochure")}
                  style={{
                    width: "100%",
                    background: "linear-gradient(90deg, #8e3c2d, #c85c11)",
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

                <div style={{ marginTop: 10, fontSize: 12.5, color: "#555", lineHeight: 1.5 }}>
                  For detailed costing / payment plan, submit your details and we will share it on call / WhatsApp.
                </div>
              </div>
            </div>
          </section>

          {/* Master Plan (kept same section) */}
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
                color: "#d35400",
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
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: isMobile || isTablet ? "10px" : "14px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                backgroundColor: "#fafafa",
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
                  background: "linear-gradient(90deg, #8e3c2d, #c85c11)",
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
                  background: "linear-gradient(90deg, #a34e35, #d4631c)",
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

          {/* Floor Plan (kept section) */}
          <section
            className="section-pad"
            style={{
              padding: isMobile || isTablet ? "30px 20px" : "60px 50px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h2 style={{ color: "#d35400", fontSize: isMobile || isTablet ? "22px" : "26px", marginBottom: "16px", marginTop: 0, fontWeight: 900 }}>
              Sanskriti Floor Plans (3 BHK Villa Floors)
            </h2>
            <div style={{ color: "#333", fontSize: isMobile ? 14 : 15.5, lineHeight: 1.7, marginBottom: 14, maxWidth: 950 }}>
              Floor plans are available in the brochure. Submit your details to receive the brochure instantly.
            </div>
            <button
              onClick={() => openLead("brochure")}
              style={{
                backgroundColor: "#a34e35",
                color: "#fff",
                border: "none",
                padding: isMobile || isTablet ? "10px 20px" : "12px 25px",
                borderRadius: "10px",
                fontWeight: 900,
                cursor: "pointer",
                fontSize: isMobile || isTablet ? "14px" : "16px",
              }}
            >
              Download Brochure
            </button>
          </section>

          {/* Amenities (unchanged section, content kept) */}
          <section id="amenities" style={{ padding: isMobile || isTablet ? "30px 20px" : "60px 50px", backgroundColor: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <h2 style={{ color: "#d35400", fontSize: isMobile || isTablet ? "22px" : "26px", margin: 0, fontWeight: 900 }}>
                Amenities Of Sanskriti
              </h2>
              <button
                onClick={() => openLead("generic")}
                style={{
                  background: "#a34e35",
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
                      boxShadow: "0 8px 20px rgba(0,0,0,.15)",
                      flexShrink: 0,
                    }}
                  >
                    <img src={item.img} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 12,
                        left: 12,
                        background: "rgba(0,0,0,.75)",
                        color: "#fff",
                        padding: "6px 12px",
                        fontSize: isMobile ? "11px" : "12px",
                        fontWeight: 900,
                        borderLeft: "4px solid #d35400",
                      }}
                    >
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Gallery (kept) */}
          <section id="gallery" style={{ padding: isMobile || isTablet ? "30px 20px" : "60px 50px", backgroundColor: "#fdfdfd" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              <h2 style={{ color: "#d35400", fontSize: isMobile || isTablet ? "22px" : "26px", margin: 0, fontWeight: 900 }}>
                Gallery Of Sanskriti
              </h2>
              <button
                onClick={() => openLead("generic")}
                style={{
                  background: "#a34e35",
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
                      boxShadow: "0 8px 20px rgba(0,0,0,.15)",
                      flexShrink: 0,
                    }}
                    alt={`Gallery ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* Location (UPDATED CONNECTIVITY AS PER YOUR CONTENT) */}
          <section
            id="location"
            className="section-pad"
            style={{
              padding: isMobile || isTablet ? "30px 20px" : "60px 50px",
              backgroundColor: "#fff",
              borderTop: "1px solid #eee",
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
              <h2 style={{ color: "#e45b0f", fontSize: isMobile || isTablet ? "22px" : "28px", margin: 0, fontWeight: 900 }}>
                Location Map & Prime Connectivity
              </h2>

              <button
                onClick={() => openLead("generic")}
                style={{
                  background: "linear-gradient(90deg, #8e3c2d, #c85c11)",
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
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  padding: isMobile || isTablet ? "8px" : "10px",
                  backgroundColor: "#fafafa",
                }}
              >
                <img src="/location.png" alt="Location Map" style={{ width: "100%", height: "auto", display: "block", borderRadius: 10 }} />
              </div>

              <div style={{ flex: 1, width: isMobile || isTablet ? "100%" : "auto" }}>
                {[
                  ["Borivali Railway Station", "Nearby"],
                  ["Borivali East Metro Station", "Nearby"],
                  ["Western Express Highway", "Quick access"],
                  ["Jain Derasar", "5 mins walk"],
                  ["Swaminarayan Temple", "200 m"],
                   ["Oberoi Sky City Mall", "5 min Walk"],

                ].map(([t, v], idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: isMobile || isTablet ? "12px 0" : "14px 0",
                      borderBottom: idx < 4 ? "1px solid #ddd" : "none",
                      fontSize: isMobile || isTablet ? "14px" : "16px",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ color: "#e45b0f", fontSize: isMobile || isTablet ? "16px" : "18px" }}>📍</span>
                      {t}
                    </span>
                    <strong>{v}</strong>
                  </div>
                ))}

                <div
                  style={{
                    marginTop: 16,
                    padding: 12,
                    borderRadius: 12,
                    background: "#fff7f2",
                    border: "1px solid #ffd9c7",
                    color: "#222",
                    lineHeight: 1.6,
                    fontSize: isMobile ? 13.5 : 14.5,
                  }}
                >
                  <b>Site Address:</b> Sanskriti Building Plot 210, Daulat Nagar Road No. 10, Borivali East, Mumbai 400066
                </div>
              </div>
            </div>
          </section>

          {/* Virtual (kept) */}
          <section
            id="virtual-visit"
            style={{
              padding: isMobile || isTablet ? "30px 20px" : "50px 50px",
              backgroundColor: "#fff",
              borderTop: "1px solid #eee",
              fontFamily: "'Poppins', 'Segoe UI', sans-serif",
            }}
          >
            <div style={{ marginBottom: isMobile || isTablet ? "20px" : "24px" }}>
              <h2 style={{ color: "#e45b0f", fontSize: isMobile || isTablet ? "22px" : "28px", margin: 0, fontWeight: 900 }}>
                Virtual Site Visitedededed
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
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                cursor: "pointer",
              }}
               onClick={() => openLead("generic")}
            >
              <img src="/g7.jpeg" alt="Virtual Site Visit" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.45)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  color: "#fff",
                }}
              >
                <div
                  style={{
                    width: isMobile || isTablet ? "60px" : "80px",
                    height: isMobile || isTablet ? "60px" : "80px",
                    backgroundColor: "#fff",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: isMobile || isTablet ? "12px" : "18px",
                    boxShadow: "0 0 22px rgba(0,0,0,0.4)",
                  }}
                >
                  <div
                    style={{
                      width: 0,
                      height: 0,
                      borderTop: isMobile || isTablet ? "10px solid transparent" : "14px solid transparent",
                      borderBottom: isMobile || isTablet ? "10px solid transparent" : "14px solid transparent",
                      borderLeft: isMobile || isTablet ? "18px solid #333" : "26px solid #333",
                      marginLeft: "5px",
                    }}
                  />
                </div>

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
                  background: "rgba(0,0,0,0.85)",
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
                    boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <source src="/videos/virtual-tour.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </section>

          {/* About + Footer (UPDATED CONTENT, section kept) */}
          <section
            style={{
              padding: isMobile || isTablet ? "40px 20px" : "70px 50px",
              backgroundColor: "#fff",
              borderTop: "1px solid #eee",
              fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: isMobile || isTablet ? "25px" : "35px",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <h2 style={{ color: "#1f2937", fontSize: isMobile || isTablet ? "22px" : "28px", margin: 0, fontWeight: 900 }}>
                About Jem World Group
              </h2>

              <button
              onClick={() => {
                const phoneNumber = "+919004183975"; // apna WhatsApp number (country code ke sath)
                const message = "Hi , I am  interested in Sanskriti by Jem World Group, Borivali East. Please share price, availability & site visit details.Thanks."
                const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                window.open(url, "_blank");
              }}
              style={{
                background: "linear-gradient(90deg, #d35400, #e67e22)",
                color: "#fff",
                border: "none",
                padding: isMobile || isTablet ? "10px 20px" : "12px 28px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Chat with us
            </button>

            </div>

            <div style={{ color: "#374151", lineHeight: "1.9", fontSize: isMobile || isTablet ? "14px" : "15.5px", maxWidth: "1100px" }}>
              <p style={{ marginBottom: "18px", textAlign: "justify" }}>
                {PROJECT_NAME} is a landmark development by Jem World Group, focused on creating a quality product with thoughtful planning, privacy
                and premium living. The project features an exclusive Villa Floor concept, Vastu-compliant homes, 3-side open layouts and
                excellent connectivity in Borivali East.
              </p>

              <div
                style={{
                  marginBottom: "18px",
                  padding: isMobile || isTablet ? "14px" : "18px 20px",
                  backgroundColor: "#fafafa",
                  border: "1px solid #eee",
                  borderRadius: "12px",
                }}
              >
                <p style={{ margin: "6px 0", fontWeight: 900 }}>{PROJECT_NAME}</p>
                <p style={{ margin: "6px 0" }}>
                  MahaRERA – <strong>P51800011430</strong>
                </p>
                <p style={{ margin: "6px 0" }}>
                  Possession – <strong>December 2026</strong>
                </p>
              </div>

              <p style={{ fontSize: isMobile || isTablet ? "12px" : "13.5px", color: "#6b7280", marginBottom: "40px" }}>
                The promoter shall execute and register a conveyance deed in favour of the allottee / association of allottees as per applicable rules.
              </p>
            </div>

            <hr style={{ border: "0", borderTop: "1px solid #eee", margin: isMobile || isTablet ? "30px 0" : "40px 0" }} />

            <footer style={{ padding: isMobile || isTablet ? "20px 0" : "30px 0", fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif" }}>
              <div style={{ fontSize: isMobile || isTablet ? "13px" : "14px", lineHeight: "1.9", color: "#111827", marginBottom: isMobile || isTablet ? "20px" : "30px", maxWidth: "1100px" }}>
                <div style={{ display: "flex", flexDirection: isMobile || isTablet ? "column" : "row", gap: isMobile || isTablet ? "8px" : "10px", marginBottom: "12px" }}>
                  <span style={{ fontWeight: 900, minWidth: isMobile || isTablet ? "auto" : "120px" }}>✓ Site Address:</span>
                  <span>Sanskriti Building Plot 210, Daulat Nagar Road No. 10, Borivali East, Mumbai 400066</span>
                </div>

                <div style={{ display: "flex", flexDirection: isMobile || isTablet ? "column" : "row", gap: isMobile || isTablet ? "8px" : "10px" }}>
                  <span style={{ fontWeight: 900, minWidth: isMobile || isTablet ? "auto" : "120px" }}>✓ Contact Us:</span>
                  <span>{PHONE}</span>
                </div>
              </div>

              <div style={{ fontSize: isMobile || isTablet ? "12px" : "13px", color: "#374151", lineHeight: "1.7", textAlign: "justify", maxWidth: "1100px", marginBottom: isMobile || isTablet ? "25px" : "35px" }}>
                <p style={{ margin: 0 }}>
                  <strong>Disclaimer:</strong> We are an authorised marketing partner for this project. Provided content is for informational purposes only.
                  Prices mentioned are subject to change without prior notice and properties are subject to availability. You may receive calls, SMS or emails on the details registered with us.
                </p>
              </div>

              <hr style={{ border: "0", borderTop: "1px solid #eee", marginBottom: isMobile || isTablet ? "15px" : "20px" }} />

              <div style={{ textAlign: "center", fontSize: isMobile || isTablet ? "12px" : "14px", color: "#1f2937" }}>
                <p style={{ margin: 0 }}>
                  © 2026 Sanskriti |
                  <a href="#" style={{ color: "#1f2937", textDecoration: "none", margin: "0 6px" }}>
                    Terms & Conditions
                  </a>
                  |
                  <a href="#" style={{ color: "#1f2937", textDecoration: "none", margin: "0 6px" }}>
                    Privacy Policy
                  </a>
                  |
                  <a href="#" style={{ color: "#1f2937", textDecoration: "none", margin: "0 6px" }}>
                    Cookies Policy
                  </a>
                </p>
              </div>
            </footer>
          </section>
        </div>

        {/* RIGHT SIDE FORM (desktop only) */}
        {!isMobile && !isTablet && (
          <aside
            className="right-pane"
            style={{
              width: rightSectionWidth,
              height: "100%",
              borderLeft: "1px solid #ddd",
              display: "flex",
              flexDirection: "column",
              padding: "20px 15px",
              boxSizing: "border-box",
              backgroundColor: "#fff",
              overflowY: "auto",
            }}
          >
            <button
              onClick={() => openLead("callback")}
              style={{
                backgroundColor: "#f39c12",
                color: "#fff",
                border: "none",
                padding: "12px",
                width: "100%",
                borderRadius: "10px",
                fontWeight: 900,
                marginBottom: "18px",
                cursor: "pointer",
                boxShadow: "0 10px 18px rgba(243,156,18,0.22)",
              }}
            >
              📞 Instant Call Back
            </button>

            <EnquiryBlock />

            <div style={{ marginTop: "auto", textAlign: "center", paddingTop: "18px", paddingBottom: "10px" }}>
              <div style={{ fontSize: "24px" }}>📄</div>
              <p style={{ fontSize: "11px", fontWeight: 900, margin: "8px 0 0 0", lineHeight: 1.2 }}>
                Download <br /> Brochure
              </p>

              <button
                onClick={() => openLead("brochure")}
                style={{
                  marginTop: 10,
                  background: "#fff",
                  border: "1px solid #ddd",
                  padding: "10px 12px",
                  borderRadius: 12,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                Open Brochure
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* ✅ MOBILE: bottom sticky CTA bar */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: "#fff",
            borderTop: "1px solid rgba(0,0,0,0.12)",
            padding: "10px 10px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            boxShadow: "0 -14px 30px rgba(0,0,0,0.12)",
          }}
        >
          <a
            href={`tel:${PHONE}`}
            style={{
              textDecoration: "none",
              background: "linear-gradient(135deg, #a34e35, #d4631c)",
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
              background: "linear-gradient(135deg, #a34e35, #d4631c)",
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
              background: "linear-gradient(135deg, #a34e35, #d4631c)",
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

      {/* IMAGE PREVIEW MODAL */}
      {previewImg && (
        <div
          onClick={() => setPreviewImg(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
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
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}
          />
        </div>
      )}

      {/* LEAD MODAL */}
      {showLeadModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
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
              }}
            >
              ×
            </span>

            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <div
                style={{
                  width: isMobile || isTablet ? "100%" : "35%",
                  minWidth: "240px",
                  background: "#fff7f2",
                  padding: "30px 20px",
                }}
              >
                <h3 style={{ color: "#e66a00", marginBottom: 20, fontWeight: 900 }}>We Promise</h3>

                {["Instant Call Back", "Free Site Visit", "Best Offers"].map((text) => (
                  <div
                    key={text}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 18,
                      color: "#e66a00",
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    <span
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        background: "#ffe1cc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </span>
                    {text}
                  </div>
                ))}
              </div>

              <div style={{ flex: 1, padding: "30px 30px" }}>
                <h3 style={{ marginBottom: 10, fontWeight: 900 }}>
                  Register Here And Avail The <span style={{ color: "#e66a00" }}>Best Offers!!</span>
                </h3>
                <div style={{ marginBottom: 18, color: "#444", fontSize: 13.5, lineHeight: 1.5 }}>
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
                      background: "rgba(0, 150, 0, 0.08)",
                      border: "1px solid rgba(0,150,0,0.2)",
                      color: "#0a7a0a",
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
                  style={inputStyle}
                />

                <input
                  placeholder="Email Address (Optional)"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  style={inputStyle}
                />

                <div style={{ display: "flex", gap: 10 }}>
                  <select style={{ ...inputStyle, marginBottom: 16, width: 140, flex: "0 0 140px" }}>
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
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>

                <button
                  disabled={!isValid || loading}
                  onClick={() => submitEnquiry({ autoCloseModal: true, downloadAfter: leadAction })}
                  style={{
                    marginTop: 10,
                    width: "100%",
                    padding: "14px",
                    background: "#e66a00",
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
                background: "#e66a00",
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
