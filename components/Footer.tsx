'use client';

import {
    Phone,
    Mail,
    MapPin,
    ArrowUpRight,
} from 'lucide-react';

import {
    FaFacebookF,
    FaInstagram,
    FaXTwitter,
} from 'react-icons/fa6';

const quickLinks = [
    'Home',
    'About',
    'Fleet',
    'Popular Routes',
    'Contact',
];

const contacts = [
    {
        Icon: Phone,
        text: '+91 8796807060',
    },
    {
        Icon: Mail,
        text: 'Skholidays9000@gmail.com',
    },
    {
        Icon: MapPin,
        text: 'Pune, Maharashtra',
    },
];

const socials = [
    {
        Icon: FaFacebookF,
        href: '#',
    },
    {
        Icon: FaInstagram,
        href: '#',
    },
    {
        Icon: FaXTwitter,
        href: '#',
    },
];

export default function Footer() {
    return (
        <footer
            id="contact"
            className="relative overflow-hidden
                 border-t border-border
                 bg-background
                 px-6 pt-10 pb-8"
        >
            {/* Background Glow */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">

                {/* Dark mode glow only */}
                <div
                    className="absolute -top-32 left-1/4 h-[350px] w-[350px]
                     rounded-full blur-3xl opacity-0 dark:opacity-20 animate-pulse"
                    style={{
                        background:
                            'radial-gradient(circle, rgba(20,184,166,0.5) 0%, transparent 70%)',
                    }}
                />

                <div
                    className="absolute bottom-0 right-0 h-[300px] w-[300px]
                     rounded-full blur-3xl opacity-0 dark:opacity-10"
                    style={{
                        background:
                            'radial-gradient(circle, rgba(45,212,191,0.45) 0%, transparent 70%)',
                    }}
                />
            </div>
            <div className="relative z-10 max-w-7xl mx-auto">
                {/* TOP */}
                <div className="grid lg:grid-cols-[1.3fr_0.8fr_1fr] gap-14 pb-8">
                    {/* Brand */}
                    <div className="animate-fade-up">
                        <div className="mb-6">
                            <h2
                                className="text-4xl md:text-4xl font-black text-primary mb-3"
                            >
                                SK CAR RENTAL
                            </h2>
                            <div className="h-[2px] w-24 bg-primary rounded-full" />
                        </div>
                        <p className="text-muted leading-8 max-w-md text-[15px]">
                            Premium cab services built for comfort, safety and luxury.
                            Travel seamlessly across Maharashtra with experienced drivers,
                            clean vehicles and 24/7 customer support.
                        </p>
                        {/* Socials */}
                        <div className="flex items-center gap-4 mt-8">
                            {socials.map(({ Icon, href }, i) => (
                                <a
                                    key={i}
                                    href={href}
                                    className="group relative h-12 w-12 rounded-2xl
                             border border-border
                             bg-card
                             flex items-center justify-center
                             hover:border-primary transition-all duration-300
                             hover:-translate-y-1
                             dark:hover:shadow-[0_0_25px_rgba(45,212,191,0.35)]"
                                >
                                    <Icon
                                        size={18}
                                        className="text-muted group-hover:text-primary transition-colors"
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                    {/* Quick Links */}
                    <div className="animate-fade-up delay-100">
                        <h3 className="text-2xl font-bold text-foreground mb-8">
                            Quick Links
                        </h3>
                        <ul className="space-y-5">

                            {quickLinks.map((link) => (
                                <li key={link}>
                                    <a
                                        href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
                                        className="group inline-flex items-center gap-3
                               text-muted hover:text-primary
                               transition-all duration-300"
                                    >
                                        <span
                                            className="h-2 w-2 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300" />
                                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                                            {link}
                                        </span>
                                        <ArrowUpRight
                                            size={15}
                                            className="opacity-0 -translate-x-2
                                            group-hover:opacity-100
                                            group-hover:translate-x-0
                                            transition-all duration-300"
                                        />
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="animate-fade-up delay-200">
                        <h3 className="text-2xl font-bold text-foreground mb-8">
                            Contact Us
                        </h3>
                        <div className="space-y-5">
                            {contacts.map(({ Icon, text }, i) => (
                                <div
                                    key={i}
                                    className="group flex items-start gap-4"
                                >
                                    <div
                                        className="h-12 w-12 rounded-2xl border border-border
                               bg-card
                               flex items-center justify-center
                               group-hover:border-primary
                               transition-all duration-300
                               dark:group-hover:shadow-[0_0_20px_rgba(45,212,191,0.25)]"
                                    >
                                        <Icon
                                            size={18}
                                            className="text-primary"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-muted leading-7">
                                            {text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mini CTA */}
                        {/* <div
                            className="mt-8 rounded-3xl border border-primary/20
                         bg-primary/10 p-5 backdrop-blur-xl"
                        >
                            <h4 className="text-lg font-bold text-foreground mb-2">
                                Need Instant Booking?
                            </h4>

                            <p className="text-sm text-muted mb-4">
                                Contact us now for quick cab confirmation.
                            </p>

                            <a
                                href="tel:+918796807060"
                                className="inline-flex items-center gap-2
                           bg-primary text-primary-foreground
                           px-5 py-3 rounded-xl
                           font-semibold hover:scale-105
                           transition-all duration-300"
                            >
                                <Phone size={16} />
                                Call Now
                            </a>
                        </div> */}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />

                {/* Bottom */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
                    <p className="text-muted text-center md:text-left">
                        © 2026 SK Car Rental. All rights reserved. </p>
                    <p className="text-muted text-center md:text-right">
                        Website Developed By{' '}
                        <a
                            href="https://amigonexus.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-primary
                 transition-all duration-300
                 hover:opacity-80 hover:underline"
                        >
                            AmigoNexus Technologies
                        </a>
                    </p>
                </div>
            </div>
        </footer >
    );
}