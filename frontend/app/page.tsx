import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";
import { ArrowRight, Brain, Clock, Users, Shield, Zap, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Logo width={120} height={120} classname="drop-shadow-lg" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Neuro<span className="text-blue-600">Flow</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-powered hospital queue management system that streamlines
              patient flow through intelligent triaging and real-time queue
              management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                Patient Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center px-8 py-4 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors shadow-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How NeuroFlow Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Revolutionary AI-powered system designed to optimize hospital
              operations and enhance patient experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Patient Experience
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Easy signup and appointment booking
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Real-time queue status tracking
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Automated priority calculation
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Email & SMS notifications
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-6">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Smart Queue Management
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Real-time queue updates
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Dynamic priority adjustments
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Efficient patient flow
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Reduced waiting times
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-xl shadow-lg">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                AI-Powered Intelligence
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Intelligent condition severity analysis
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Predictive scheduling
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Historical pattern recognition
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  Smart overflow handling
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose NeuroFlow?
            </h2>
            <p className="text-xl text-gray-600">
              Transforming healthcare delivery with cutting-edge technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Reduced Wait Times
              </h3>
              <p className="text-gray-600">
                AI optimization ensures efficient patient flow and minimal
                waiting
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-Time Updates
              </h3>
              <p className="text-gray-600">
                Live queue status and instant notifications keep everyone
                informed
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Smart Prioritization
              </h3>
              <p className="text-gray-600">
                AI-driven triage ensures urgent cases receive immediate
                attention
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure & Reliable
              </h3>
              <p className="text-gray-600">
                Enterprise-grade security with role-based access control
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-600">
              Powered by industry-leading frameworks and tools
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              {
                name: "Next.js",
                logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
                bgColor: "bg-black",
              },
              {
                name: "Node.js",
                logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
                bgColor: "bg-green-100",
              },
              {
                name: "Python",
                logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
                bgColor: "bg-blue-100",
              },
              {
                name: "PostgreSQL",
                logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
                bgColor: "bg-blue-50",
              },
              {
                name: "Tailwind CSS",
                logo: "https://tailwindcss.com/_next/static/media/tailwindcss-mark.d52e9897.svg",
                bgColor: "bg-cyan-50",
              },
              {
                name: "TypeScript",
                logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
                bgColor: "bg-blue-50",
              },
            ].map((tech) => (
              <div
                key={tech.name}
                className="text-center group hover:transform hover:scale-105 transition-transform duration-200"
              >
                <div
                  className={`w-16 h-16 ${tech.bgColor} rounded-lg flex items-center justify-center mx-auto mb-3 shadow-lg border border-gray-200 group-hover:shadow-xl transition-shadow duration-200 p-2`}
                >
                  <Image
                    src={tech.logo}
                    alt={`${tech.name} logo`}
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain"
                  />
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                  {tech.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <Logo width={40} height={40} />
                <span className="ml-3 text-2xl font-bold">NeuroFlow</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Revolutionizing healthcare delivery through AI-powered queue
                management and intelligent patient flow optimization.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-white transition-colors"
                  >
                    Patient Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="hover:text-white transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>AI-Powered Triage</li>
                <li>Real-Time Queue Management</li>
                <li>Smart Notifications</li>
                <li>Comprehensive Analytics</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 NeuroFlow. All rights reserved. | Version 1.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
