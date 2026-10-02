export const metadata = {
  title: "Live Webinars & Online Masterclasses",
  description:
    "Register for interactive online masterclasses and webinars led by Avinash Gore. Gain actionable insights on career planning, scientific study techniques, and overcoming self-doubt.",
  alternates: {
    canonical: "/webinars",
  },
  openGraph: {
    title: "Live Webinars & Masterclasses | Avinash Gore",
    description:
      "Join online interactive sessions designed to build confidence, provide career roadmaps, and foster peak performance.",
    url: "/webinars",
    images: [
      {
        url: "/images/image 2.jpg",
        width: 800,
        height: 600,
        alt: "Webinars by Avinash Gore",
      },
    ],
  },
};

export default function WebinarsLayout({ children }) {
  return children;
}
