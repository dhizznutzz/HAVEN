import Link from "next/link";
import { Sprout, ArrowRight, Zap, MapPin, Users, Heart } from "lucide-react";

const pillars = [
  {
    icon: Sprout,
    name: "Grow",
    color: "bg-purple-50 text-purple-700 border-purple-100",
    iconBg: "bg-purple-100 text-purple-600",
    description:
      "Share skills, join challenges, earn badges, and level up with AI-powered learning paths.",
    href: "/grow",
  },
  {
    icon: MapPin,
    name: "Connect",
    color: "bg-teal-50 text-teal-700 border-teal-100",
    iconBg: "bg-teal-100 text-teal-600",
    description:
      "Discover volunteering, internships, and programs near you — with smart AI matching.",
    href: "/connect",
  },
  {
    icon: Users,
    name: "Circle",
    color: "bg-amber-50 text-amber-700 border-amber-100",
    iconBg: "bg-amber-100 text-amber-600",
    description:
      "Join interest-based groups, find study buddies, and build your peer network.",
    href: "/circle",
  },
  {
    icon: Heart,
    name: "Safe Space",
    color: "bg-rose-50 text-rose-700 border-rose-100",
    iconBg: "bg-rose-100 text-rose-600",
    description:
      "Talk to Rakan, our AI companion, or connect with peer listeners — always anonymous.",
    href: "/safe-space",
  },
];

const steps = [
  {
    step: "01",
    title: "Create your profile",
    description: "Tell us your skills, interests, and goals. Takes 2 minutes.",
  },
  {
    step: "02",
    title: "AI learns your style",
    description:
      "Tumbuh builds your personalised feed, matches, and learning path from day one.",
  },
  {
    step: "03",
    title: "Grow with your community",
    description: "Share, connect, and thrive — with real youth across Malaysia.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-6 pt-16 pb-20 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-xs text-purple-700 font-medium mb-8">
          <Zap className="w-3 h-3" />
          Built for Malaysian youth, powered by AI
        </div>

        <h1 className="text-5xl md:text-6xl font-medium text-gray-900 tracking-tight leading-tight">
          Tumbuh
          <br />
          <span className="text-purple-600">Grow Together</span>
        </h1>

        <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          The platform where Malaysian youth aged 15–30 develop skills, find
          opportunities, build circles, and support each other — all powered by
          AI.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/feed"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Explore the feed
          </Link>
        </div>
      </section>

      {/* Pillars */}
      <section className="px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-medium text-gray-900 text-center mb-2">
            Four pillars. One platform.
          </h2>
          <p className="text-sm text-gray-500 text-center mb-10">
            Everything you need to grow as a young Malaysian.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {pillars.map(({ icon: Icon, name, color, iconBg, description, href }) => (
              <Link
                key={name}
                href={href}
                className={`rounded-xl border p-5 ${color} hover:scale-[1.01] transition-transform block`}
              >
                <div
                  className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium mb-1">{name}</h3>
                <p className="text-xs opacity-70 leading-relaxed">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-medium text-gray-900 text-center mb-10">
            How it works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map(({ step, title, description }) => (
              <div key={step} className="text-center">
                <div className="text-3xl font-medium text-purple-200 mb-3">
                  {step}
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="px-6 py-16 bg-purple-50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-purple-100 text-sm text-purple-700 font-medium mb-6">
            🏆 UPM Hackathon 2025
          </div>
          <h2 className="text-2xl font-medium text-gray-900 mb-3">
            Built for Malaysian youth
          </h2>
          <p className="text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
            Tumbuh was created with Malaysian youth in mind — local job market
            insights, Bahasa Malaysia support, and partnerships with local
            organisations.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-10 border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Tumbuh</span>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Privacy-first platform. Anonymous by default in Safe Space. No
            individual data shared with institutions.
          </p>
          <div className="flex gap-4 text-xs text-gray-400">
            <Link href="/safe-space" className="hover:text-gray-700">
              Mental Health
            </Link>
            <span>·</span>
            <span>03-7627 2929 (Befrienders)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
