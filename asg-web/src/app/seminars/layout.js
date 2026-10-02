export const metadata = {
  title: "In-Person Seminars & Youth Workshops",
  description:
    "Attend transformative in-person seminars and workshops conducted by Avinash Gore. Experiential learning, student mindset transformation, and corporate leadership sessions.",
  alternates: {
    canonical: "/seminars",
  },
  openGraph: {
    title: "In-Person Seminars & Youth Workshops | Avinash Gore",
    description:
      "Transforming fear into focus. Book seats for high-impact seminars and student mastery sessions.",
    url: "/seminars",
    images: [
      {
        url: "/images/image3.jpg",
        width: 800,
        height: 600,
        alt: "Seminars by Avinash Gore",
      },
    ],
  },
};

export default function SeminarsLayout({ children }) {
  return children;
}
