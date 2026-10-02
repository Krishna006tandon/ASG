export const metadata = {
  title: "Author Bookstore & Publications | Buy 'Come on... You can do it!'",
  description:
    "Official bookstore for books authored by Avinash Gore. Purchase 'Come on... You can do it!' in digital eBook and paperback formats. Practical guides for exam mastery and youth success.",
  alternates: {
    canonical: "/ecommerce",
  },
  openGraph: {
    title: "Author Bookstore & Publications | Avinash Gore",
    description:
      "Explore books by Avinash Gore. Instant eBook downloads and physical paperback delivery across India.",
    url: "/ecommerce",
    images: [
      {
        url: "/images/image1.png",
        width: 800,
        height: 600,
        alt: "Come on... You can do it! by Avinash Gore",
      },
    ],
  },
};

export default function EcommerceLayout({ children }) {
  return children;
}
