import React from "react";

const Privacy = () => {
  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto", lineHeight: "1.7", fontFamily: "Arial, sans-serif" }}>
      <h1>Privacy Policy</h1>
      <p>At <strong>RemoraAI</strong>, your privacy is our top priority. We design our platform to respect your data and keep it secure, while providing a seamless AI-powered experience.</p>

      <h2>1. What We Collect</h2>
      <p>We may collect the following information to help RemoraAI function optimally:</p>
      <ul>
        <li>Messages and conversations you save for context.</li>
        <li>Preferences, settings, and any project-related notes stored locally.</li>
        <li>Technical data like device type and browser information for performance optimization.</li>
      </ul>

      <h2>2. How We Use Your Data</h2>
      <p>Your data is used exclusively to provide AI responses, remember your context, and improve your experience. We never sell or share your personal messages or saved memories.</p>

      <h2>3. Local-First Privacy</h2>
      <p>RemoraAI uses local storage to save context, meaning most of your data stays on your device. Remote storage is optional and only used if explicitly enabled by you.</p>

      <h2>4. Security</h2>
      <p>We implement industry-standard security measures to protect any data that is stored remotely. Your saved memories and conversation threads are encrypted and never accessible to third parties without your consent.</p>

      <h2>5. Third-Party Services</h2>
      <p>We do not share your personal data with third parties except for necessary integrations that you explicitly enable.</p>

      <h2>6. Your Rights</h2>
      <p>You can delete any saved memory or clear all your contexts at any time using the memory panel in the chat interface.</p>

      <h2>7. Updates to Privacy Policy</h2>
      <p>We may update this policy occasionally. Changes will be reflected on this page, so please check back periodically.</p>

      <p style={{ marginTop: "2rem" }}>If you have any questions, contact us at <a href="mailto:codencyindia@gmail.com">codencyindia@gmail.com</a>.</p>
    </div>
  );
};

export default Privacy;
