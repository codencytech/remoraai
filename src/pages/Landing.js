// Landing.jsx
import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import "./Landing.css";
import LogoImage from "../assets/logo.png";


const Landing = () => {
  const navigate = useNavigate();

  // particles init
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  // small parallax using mouse position (for hero)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  const handleMouseMove = (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    x.set((e.clientX - cx) / 30);
    y.set((e.clientY - cy) / 30);
  };

  // motion variants
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.16 } },
  };
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9 } },
  };

  return (
    <div
      className="landing-root"
      onMouseMove={handleMouseMove}
      style={{ minHeight: "100vh", backgroundColor: "#f7fbff" }} // ensures full height and visible background
    >
      {/* Particles - background */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: { color: { value: "#f7fbff" } },
          fpsLimit: 60,
          particles: {
            number: { value: 55, density: { enable: true, area: 900 } },
            color: { value: ["#6E00FF", "#00C6FF", "#FF0077"] },
            shape: { type: "circle" },
            opacity: {
              value: 0.45,
              random: { enable: true, minimumValue: 0.15 },
              anim: { enable: true, speed: 0.6, minimumValue: 0.15 },
            },
            size: {
              value: { min: 1.2, max: 5 },
              random: true,
              anim: { enable: true, speed: 2, minimumValue: 0.6 },
            },
            move: {
              enable: true,
              speed: 1.6,
              direction: "none",
              outModes: { default: "bounce" },
              random: true,
            },
            links: { enable: true, distance: 140, color: "#cde9ff", opacity: 0.12, width: 1 },
          },
          interactivity: {
            events: { onHover: { enable: true, mode: "grab" }, onClick: { enable: true, mode: "push" } },
            modes: { grab: { distance: 140, links: { opacity: 0.25 } }, push: { quantity: 3 } },
          },
          detectRetina: true,
        }}
      />

      {/* Page content container */}
      <motion.div className="page" initial="hidden" animate="show" variants={container}>
        {/* Header */}
        <motion.header className="header" variants={fadeUp}>
          <div className="brand">
            <motion.div
              className="logo"
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              <img src={LogoImage} alt="Remora AI Logo" className="logo-img" />
            </motion.div>

            <div className="brand-text">
              <h1 className="brand-title">
                Remora <span className="accent">AI</span>
              </h1>
              <p className="brand-tag">
                Your private, context-saving AI sidekick (that actually remembers things).
              </p>
            </div>
          </div>
          <nav className="header-nav">
            <a href="#how" className="nav-link">How it works</a>
            <a href="#team" className="nav-link">Team</a>
            <a href="#highlights" className="nav-link">Hackathon</a>
          </nav>
        </motion.header>

        {/* HERO - parallax */}
        <section className="hero-section">
          <motion.div
            style={{ rotateX, rotateY }}
            className="hero-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
          >
            <motion.h2 className="hero-title" layout>
              We remember so you don't have to.
            </motion.h2>
            <motion.p className="hero-lead" variants={fadeUp}>
              Build projects, save important context, and chat like a human — RemoraAI keeps the thread, so you can keep shipping. Problem solver by design, slightly cheeky by personality.
            </motion.p>
            <motion.div className="hero-actions" variants={fadeUp}>
              <motion.button
                className="cta primary"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(110,0,255,0.18)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/chat")}
              >
                Start Chatting — It’s magic (kinda)
              </motion.button>
              <motion.a className="cta ghost" href="#how" whileHover={{ scale: 1.03 }}>
                See How It Works
              </motion.a>
            </motion.div>
            <motion.div className="hero-meta" variants={fadeUp}>
              <div className="meta-item"><strong>Use-case:</strong> Rapid prototyping for devs & no-devs</div>
              <div className="meta-item"><strong>Latency:</strong> Fast—locally friendly</div>
              <div className="meta-item"><strong>Privacy:</strong> Yours. Period.</div>
            </motion.div>
          </motion.div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="how-section" aria-label="How it works">
          <motion.h3 className="section-title" variants={fadeUp}>How it works</motion.h3>
          <motion.div className="steps-grid">
            <motion.div className="step-card" variants={fadeUp}>
              <div className="step-number">1</div>
              <h4>Tell it what to build</h4>
              <p>Describe the app, site, or tool you want — from calculator to ecommerce skeleton. We parse intent & scope.</p>
            </motion.div>
            <motion.div className="step-card" variants={fadeUp}>
              <div className="step-number">2</div>
              <h4>Context is auto-saved</h4>
              <p>Say “save” or the app detects important details automatically. Your preferences, project notes, and settings are stored locally.</p>
            </motion.div>
            <motion.div className="step-card" variants={fadeUp}>
              <div className="step-number">3</div>
              <h4>Talk naturally</h4>
              <p>Ask questions, request changes, or refer to saved items — Remora replies with context-aware answers and code snippets.</p>
            </motion.div>
            <motion.div className="step-card" variants={fadeUp}>
              <div className="step-number">4</div>
              <h4>Ship faster</h4>
              <p>Export code, get design suggestions, iterate quickly — fewer repeats, more momentum. Judges love momentum 🔥</p>
            </motion.div>
          </motion.div>
        </section>

        {/* FEATURES */}
        <section className="features-section">
          <motion.h3 className="section-title" variants={fadeUp}>What makes Remora stand out</motion.h3>
          <motion.div className="features-grid">
            <motion.article className="feature" variants={fadeUp}>
              <div className="feature-emoji">🎯</div>
              <h4>Context Memory</h4>
              <p>Saves project details so AI doesn't ask “what project?” for the 12th time.</p>
            </motion.article>
            <motion.article className="feature" variants={fadeUp}>
              <div className="feature-emoji">🔒</div>
              <h4>Local-First Privacy</h4>
              <p>Data primarily stays on-device (you decide what goes remote). We don't peek — promise.</p>
            </motion.article>
            <motion.article className="feature" variants={fadeUp}>
              <div className="feature-emoji">⚡</div>
              <h4>Instant Recall</h4>
              <p>Mention saved items and AI brings full context into the conversation instantly.</p>
            </motion.article>
            <motion.article className="feature" variants={fadeUp}>
              <div className="feature-emoji">🧩</div>
              <h4>Everything-as-a-Request</h4>
              <p>From "make a calculator" to "generate a landing page", ask and receive a scaffold or full code sample.</p>
            </motion.article>
          </motion.div>
        </section>

        {/* TEAM */}
        <section id="team" className="team-section">
          <motion.h3 className="section-title" variants={fadeUp}>Meet the makers</motion.h3>
          <motion.div className="team-grid">
            <motion.div className="person-card" variants={fadeUp}>
              <div className="avatar">👨‍💻</div>
              <h4>Ayush Kumar Singh</h4>
              <p className="role">Project Lead — planning, backend & full-stack delivery</p>
              <p className="bio">Built the architecture, wired up the AI, and made sure the app actually shipped. Loves coffee and clean code.</p>
            </motion.div>
            <motion.div className="person-card" variants={fadeUp}>
              <div className="avatar">🧑‍🎨</div>
              <h4>Pranjal Gupta</h4>
              <p className="role">Designer & AI Integrator — UI magic + model integration</p>
              <p className="bio">Designed the pixel-perfect UI and connected the model to behave. Makes animations that distract in good ways.</p>
            </motion.div>
          </motion.div>
          <motion.div className="credit-line" variants={fadeUp}>
            Built with ❤️ and the help of advanced AI technology (Google Gemini). We acknowledge Google for their AI offerings.
          </motion.div>
        </section>

        {/* HIGHLIGHTS */}
        <section id="highlights" className="highlights-section">
          <motion.h3 className="section-title" variants={fadeUp}>Why this wins (short & sweet)</motion.h3>
          <motion.ul className="highlights-list" variants={fadeUp}>
            <li><strong>Clear value:</strong> Cuts repetitive context work — saves time for real thinking.</li>
            <li><strong>Privacy-first:</strong> Local-first design reduces data exposure concerns.</li>
            <li><strong>Hackable:</strong> Extensible architecture for integrations & future features.</li>
          </motion.ul>
        </section>

        {/* FOOTER */}
        <footer className="site-footer" role="contentinfo">
          <div className="footer-main">
            <div className="footer-left">
              <motion.div
              className="logo"
              animate={{ rotate: [0, 6, -6, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
            >
              <img src={LogoImage} alt="Remora AI Logo" className="logo-img" />
            </motion.div>
              <div className="small-brand">RemoraAI</div>
              <div className="footer-email">
                Contact: <a href="mailto:codencyindia@gmail.com">codencyindia@gmail.com</a>
              </div>
            </div>
          </div>
          <div className="footer-note">© {new Date().getFullYear()} RemoraAI — Built for Hackathon. All rights reserved.</div>
        </footer>
      </motion.div>
    </div>
  );
};

export default Landing;
