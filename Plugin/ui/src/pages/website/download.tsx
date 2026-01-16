/**
 * Download Page
 * 
 * Private download page for SONA - AI Audio Generation Plugin
 * Modern, clean design with gradient effects and animated elements
 */

import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingNav } from "@/components/landing/landing-nav"
import { VersionBadge } from "@/components/shared/version-badge"
import { Download, CheckCircle, Monitor, Cpu, HardDrive, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Link } from "react-router-dom"

type Platform = 'windows' | 'mac'
type Format = 'vst3' | 'standalone' | 'all'

export default function DownloadPage() {
    const [selectedPlatform, setSelectedPlatform] = useState<Platform>('windows')
    const [selectedFormat, setSelectedFormat] = useState<Format>('all')

    const handleDownload = () => {
        // TODO: Implement actual download logic
        console.log(`Downloading ${selectedFormat} for ${selectedPlatform}`)
        // Example: window.location.href = `/downloads/sona-${selectedPlatform}-${selectedFormat}.zip`
    }

    return (
        <div className="landing-page min-h-screen bg-landing-bg-light dark:bg-landing-bg-dark text-landing-text-light dark:text-landing-text-dark transition-colors duration-300">
            {/* Grain Overlay Effect */}
            <div className="grain-overlay mix-blend-overlay dark:mix-blend-overlay" />

            {/* Navigation */}
            <LandingNav />

            {/* Main Content */}
            <main>
                {/* Hero Section */}
                <section className="bg-gradient-to-br to-landing-bg-dark/80 from-primary/80 mb-16 relative pt-32 lg:pt-40 overflow-hidden">
                    {/* Background Glow Effects */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden -z-10 pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
                        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-sona-designer/10 rounded-full blur-[100px]" />
                    </div>

                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        {/* <div className="inline-block mb-4">
                            <div className="h-px w-12 bg-primary mx-auto mb-6" />
                        </div> */}

                        <h1 className="font-display text-4xl md:text-7xl font-bold mb-4">
                            Download <span className="bg-gradient-to-r from-primary to-sona-gold bg-clip-text text-transparent">SONA</span>
                        </h1>

                        <p className="text-landing-subtext-dark dark:text-landing-subtext-dark text-lg mb-4">
                            Get started with SONA in minutes. Available for Windows and macOS as VST3 and Standalone.
                        </p>

                        {/* Version Badge */}
                        <VersionBadge />

                        {/* Changelog */}
                        <div className="mt-6 mb-32 flex flex-col ">
                            <Link to="/changelog" className="text-blue-500  hover:underline decoration-blue-500">View Changelog ↗</Link>
                        </div>
                    </div>
                </section>

                {/* Download Section */}
                <section className="pb-24">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Download Card */}
                        <div className="bg-landing-surface-light dark:bg-landing-surface-dark rounded-3xl border border-gray-200 dark:border-white/5 p-8 md:p-12 shadow-2xl">
                            {/* Platform Selection */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium mb-4 text-landing-subtext-light dark:text-landing-subtext-dark">
                                    Select your platform
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setSelectedPlatform('windows')}
                                        className={`p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 ${selectedPlatform === 'windows'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                            }`}
                                    >
                                        <Monitor className="w-8 h-8" />
                                        <span className="font-medium">Windows</span>
                                        <span className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark">Windows 10+</span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedPlatform('mac')}
                                        className={`p-6 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center gap-3 ${selectedPlatform === 'mac'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                            }`}
                                    >
                                        <Monitor className="w-8 h-8" />
                                        <span className="font-medium">macOS</span>
                                        <span className="text-xs text-landing-subtext-light dark:text-landing-subtext-dark">macOS 11+</span>
                                    </button>
                                </div>
                            </div>

                            {/* Format Selection */}
                            <div className="mb-8">
                                <label className="block text-sm font-medium mb-4 text-landing-subtext-light dark:text-landing-subtext-dark">
                                    Select format
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        onClick={() => setSelectedFormat('all')}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${selectedFormat === 'all'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                            }`}
                                    >
                                        <span className="font-medium text-sm">Full Bundle</span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedFormat('vst3')}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${selectedFormat === 'vst3'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                            }`}
                                    >
                                        <span className="font-medium text-sm">VST3 Only</span>
                                    </button>
                                    <button
                                        onClick={() => setSelectedFormat('standalone')}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${selectedFormat === 'standalone'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
                                            }`}
                                    >
                                        <span className="font-medium text-sm">Standalone</span>
                                    </button>
                                </div>
                            </div>

                            {/* Download Button */}
                            <button
                                onClick={handleDownload}
                                className="w-full bg-primary text-white px-8 py-5 rounded-2xl text-lg font-medium hover:bg-amber-700 transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-3 group mb-6"
                            >
                                <Download className="w-6 h-6 group-hover:translate-y-0.5 transition-transform" />
                                Download SONA for {selectedPlatform === 'windows' ? 'Windows' : 'macOS'}
                            </button>

                            {/* File Info */}
                            <p className="text-center text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                                Size: ~145 MB • Format: {selectedFormat === 'all' ? 'VST3 + Standalone' : selectedFormat.toUpperCase()}
                            </p>
                        </div>

                        {/* System Requirements */}
                        <div className="mt-12 grid md:grid-cols-2 gap-6">
                            <div className="bg-landing-bg-light dark:bg-landing-bg-dark rounded-2xl border border-gray-200 dark:border-white/5 p-6">
                                <h3 className="font-display text-xl font-medium mb-4 flex items-center gap-2">
                                    <Cpu className="w-5 h-5 text-primary" />
                                    System Requirements
                                </h3>
                                <ul className="space-y-3 text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        <span>Windows 10/11 or macOS 11+</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        <span>Intel Core i5 or AMD equivalent (Apple Silicon supported)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        <span>8 GB RAM minimum (16 GB recommended)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        <span>200 MB free disk space</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                        <span>Internet connection for audio generation</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-landing-bg-light dark:bg-landing-bg-dark rounded-2xl border border-gray-200 dark:border-white/5 p-6">
                                <h3 className="font-display text-xl font-medium mb-4 flex items-center gap-2">
                                    <HardDrive className="w-5 h-5 text-primary" />
                                    Installation Guide
                                </h3>
                                <ol className="space-y-3 text-sm text-landing-subtext-light dark:text-landing-subtext-dark">
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                                        <span>Download the installer for your platform</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                                        <span>Run the installer and follow the setup wizard</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
                                        <span>Open your DAW and scan for new plugins</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">4</span>
                                        <span>Launch SONA and sign in with your account</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">5</span>
                                        <span>Start generating audio!</span>
                                    </li>
                                </ol>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-12 text-center">
                            <p className="text-sm text-landing-subtext-light dark:text-landing-subtext-dark mb-4">
                                Need help? Check out our documentation or contact support.
                            </p>
                            <div className="flex justify-center gap-4">
                                <Link
                                    to="/changelog"
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                    Changelog
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                                <Link
                                    to="/contact"
                                    className="text-sm text-primary hover:underline flex items-center gap-1"
                                >
                                    Contact Support
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <LandingFooter />
        </div>
    )
}
