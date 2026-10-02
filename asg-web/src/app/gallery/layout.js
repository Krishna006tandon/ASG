export const metadata = {
  title: "Workshop Gallery & Keynote Highlights",
  description:
    "Explore event photo archives and corporate training highlights featuring Avinash Gore. View past workshops on HAZOP safety at Sadara & Aramco, energy summits, and student seminars.",
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: "Workshop Gallery & Corporate Keynotes | Avinash Gore",
    description:
      "Visual timeline and photo gallery of keynote speeches, engineering safety seminars, and university masterclasses.",
    url: "/gallery",
    images: [
      {
        url: "/images/image1.png",
        width: 800,
        height: 600,
        alt: "Avinash Gore Workshop Gallery",
      },
    ],
  },
};

export default function GalleryLayout({ children }) {
  return children;
}
