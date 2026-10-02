export const metadata = {
  title: "1-on-1 Consulting | Startup Advisory & Process Safety",
  description:
    "Book an exclusive 1-on-1 consultation slot with Avinash Gore. Expert guidance in startup strategy, chemical engineering safety, HAZOP analysis, and career trajectory mapping.",
  alternates: {
    canonical: "/consulting",
  },
  openGraph: {
    title: "1-on-1 Business, Career & Safety Consulting | Avinash Gore",
    description:
      "Direct consultation with 25+ year industry veteran and founder Avinash Gore. Select your preferred date and time.",
    url: "/consulting",
    images: [
      {
        url: "/images/image5.jpg",
        width: 800,
        height: 800,
        alt: "Consulting with Avinash Gore",
      },
    ],
  },
};

export default function ConsultingLayout({ children }) {
  return children;
}
