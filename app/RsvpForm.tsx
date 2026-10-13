"use client";

import { useState } from "react";

export default function RsvpForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    attendance: "coming",
    dietary: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          attendance: "coming",
          dietary: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Email in a row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-[#D8895F] mb-2 font-medium">
              Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-[#1B060B] border-2 border-[#D8895F] text-[#D8895F] rounded-lg focus:outline-none focus:border-[#E9A27C]"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-[#D8895F] mb-2 font-medium">
              E-Mail
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-[#1B060B] border-2 border-[#D8895F] text-[#D8895F] rounded-lg focus:outline-none focus:border-[#E9A27C]"
            />
          </div>
        </div>

        {/* Radio Buttons */}
        <div className="space-y-3">
          <div className="flex items-center">
            <input
              type="radio"
              id="coming"
              name="attendance"
              value="coming"
              checked={formData.attendance === "coming"}
              onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
              className="w-4 h-4 accent-[#D8895F]"
            />
            <label htmlFor="coming" className="ml-3 text-[#D8895F] font-medium">
              Ich komme gern
            </label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="not-coming"
              name="attendance"
              value="not-coming"
              checked={formData.attendance === "not-coming"}
              onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
              className="w-4 h-4 accent-[#D8895F]"
            />
            <label htmlFor="not-coming" className="ml-3 text-[#D8895F] font-medium">
              Ich kann leider nicht teilnehmen
            </label>
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <label htmlFor="dietary" className="block text-[#D8895F] mb-2 font-medium">
          Unverträglichkeiten/ Allergien/ vegetarische Option?
          </label>
          <textarea
            id="dietary"
            rows={6}
            value={formData.dietary}
            onChange={(e) => setFormData({ ...formData, dietary: e.target.value })}
            className="w-full px-4 py-2 bg-[#1B060B] border-2 border-[#D8895F] text-[#D8895F] rounded-lg focus:outline-none focus:border-[#E9A27C] resize-none placeholder:text-[#D8895F]/60"
            placeholder="Optional: Bitte hier eintragen..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex flex-col items-center space-y-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-[#D8895F] text-[#1B060B] font-bold rounded-lg  cursor-pointer hover:bg-[#E9A27C] hover:text-[#1B060B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Wird gesendet..." : "Absenden"}
          </button>

          {submitStatus === "success" && (
            <p className="text-[#D8895F] font-medium">
              Vielen Dank! Ihre Antwort wurde erfolgreich übermittelt.
            </p>
          )}
          {submitStatus === "error" && (
            <p className="text-red-400 font-medium">
              Es gab einen Fehler beim Senden. Bitte versuchen Sie es erneut.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
