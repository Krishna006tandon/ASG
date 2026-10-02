import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import BackgroundSlideshow from "@/components/BackgroundSlideshow";
import JsonLd from "@/components/JsonLd";
import { getPersonSchema, getWebSiteSchema } from "@/lib/seoSchemas";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://avinashsgore.com';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Avinash Gore | Author, Career Mentor & Business Consultant",
    template: "%s | Avinash Gore",
  },
  description:
    "Official platform of Avinash Gore — Author of 'Come on... You can do it!', Career & Youth Empowerment Mentor, B.Tech Chemical Engineer & MD at Perpetual Solutions. Empowering students, young professionals, and businesses.",
  keywords: [
    "Avinash Gore",
    "Avinash S. Gore",
    "Avinash S Gore",
    "avinashsgore.com",
    "Come on... You can do it!",
    "Come on You can do it book by Avinash Gore",
    "Career Mentorship",
    "Youth Empowerment Workshops",
    "Exam Phobia Techniques",
    "Startup Consulting",
    "Financial Literacy",
    "Process Safety Management",
    "HAZOP Certified Engineer",
    "Perpetual Solutions",
    "Student Study Skills",
    "Career Guidance",
    "Business Consulting",
    "Business Mentorship",
    "Business Strategy",
    "Business Growth",
    "Business Development",
    "Business Planning",
    "Business Coaching",
    "Business Training",
    "Business Workshops",
    "Business Seminars",
    "Business Webinars",
    "Business Networking",
    "Business Opportunities",
    "Business Ideas",
    "Business Innovation",
    "Business Leadership",
    "Business Management",
    "Business Marketing",
    "Business Sales",
    "Business Branding",
    "Business Communication",
    "Business Negotiation",
    "Business Presentation Skills",
    "Business Problem Solving",
    "Business Decision Making",
    "Business Team Building",
    "Business Motivation",
    "Business Inspiration",
    "Business Success Stories", 
    "Student Mentorship",
    "Student Empowerment",
    "Student Motivation",
    "Student Inspiration",
    "Student Success Stories",
    "Student Career Guidance",
    "Student Study Skills",
    "Student Exam Preparation",
    "Student Exam Phobia Techniques",
    "Student Time Management",
    "Student Stress Management",
    "Student Leadership Skills",
    "Student Communication Skills",
    "Student Presentation Skills",
    "Student Problem Solving Skills",
    "Student Decision Making Skills",
    "Student Team Building Skills",
    "Student Motivation Techniques",
    "Student Inspiration Techniques", 
    "techniques for students", 
    "exam preparation techniques", 
    "exam phobia techniques",
    "time management techniques for students",
    "stress management techniques for students",
    "leadership skills for students",
    "communication skills for students",
    "presentation skills for students",
    "problem solving skills for students",
    "decision making skills for students",
    "team building skills for students",
    "motivation techniques for students",
    "inspiration techniques for students",
    "career guidance for students",
    "student mentorship programs",
    "youth empowerment programs",
    "career mentorship programs",
    "business consulting services",
    "business mentorship programs",
    "Student",
    "Youth",
    "Career",
    "Business",
    "Mentorship",
    "Consulting",
    "Workshops",
    "Seminars",
    "Webinars",
    "Guidance",
    "Avinash",
    "Gore",
    "Avinash S. Gore",
    "Avinash S Gore",
    "avinashsgore.com",
    "Come on... You can do it!",
    "Come on You can do it book by Avinash Gore",
    "Entrepreneurship Guidance"
  ],
  authors: [{ name: "Avinash Gore", url: siteUrl }],
  creator: "Avinash Gore",
  publisher: "Avinash Gore",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Avinash Gore Platform",
    title: "Avinash Gore | Author, Career Mentor & Business Consultant",
    description:
      "Official platform of Avinash Gore — Author of 'Come on... You can do it!', Career & Youth Empowerment Mentor, B.Tech Chemical Engineer & MD at Perpetual Solutions.",
    images: [
      {
        url: "/images/image1.png",
        width: 1200,
        height: 630,
        alt: "Avinash Gore - Author, Career Mentor & Business Consultant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Avinash Gore | Author, Career Mentor & Business Consultant",
    description:
      "Author of 'Come on... You can do it!', Career & Youth Empowerment Mentor, B.Tech Chemical Engineer & MD at Perpetual Solutions.",
    images: ["/images/image1.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  const personSchema = getPersonSchema();
  const websiteSchema = getWebSiteSchema();

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <JsonLd data={personSchema} />
        <JsonLd data={websiteSchema} />
        <CartProvider>
          <BackgroundSlideshow />
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
