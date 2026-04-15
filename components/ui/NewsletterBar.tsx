"use client";

import { useState } from "react";
import { Mail, CheckCircle } from "lucide-react";

export default function NewsletterBar() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitted(true);
    // Future: connect to email marketing platform (Mailchimp, ConvertKit, etc.)
  };

  return (
    <section
      className="relative overflow-hidden rounded-4xl"
      style={{ background: "var(--gradient-ocean)" }}
      aria-labelledby="newsletter-heading"
    >
      {/* Blob decoration */}
      <div
        className="absolute -right-16 -top-16 w-64 h-64 rounded-full opacity-20"
        style={{ background: "var(--color-sky)", filter: "blur(60px)" }}
        aria-hidden="true"
      />
      <div
        className="absolute -left-8 -bottom-8 w-48 h-48 rounded-full opacity-15"
        style={{ background: "var(--color-sun)", filter: "blur(50px)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 px-8 py-10 md:px-12 md:py-12">
        {submitted ? (
          <div className="flex flex-col sm:flex-row items-center gap-4 text-white">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-700 text-xl mb-1">You&apos;re in!</h3>
              <p className="text-white/70 text-sm">
                Daily forecasts will land in your inbox. Check your email to confirm your subscription.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Text */}
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Mail size={22} className="text-white" />
              </div>
              <div>
                <h3
                  id="newsletter-heading"
                  className="font-700 text-xl text-white mb-1"
                >
                  Get daily forecasts in your inbox
                </h3>
                <p className="text-white/65 text-sm">
                  Weather updates, travel tips and microclimate reports - every morning.
                </p>
              </div>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 w-full md:w-auto"
              noValidate
            >
              <div className="flex flex-col gap-1">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="your@email.com"
                    aria-label="Email address"
                    required
                    className="w-full sm:w-64 px-5 py-3 rounded-full text-sm outline-none transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: error ? "1.5px solid rgba(255,100,100,0.7)" : "1.5px solid rgba(255,255,255,0.3)",
                      color: "white",
                    }}
                  />
                </div>
                {error && (
                  <p className="text-red-300 text-xs pl-4">{error}</p>
                )}
              </div>
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
