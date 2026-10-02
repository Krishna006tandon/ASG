export const metadata = {
  title: "Reviews & Testimonials | Student & Client Feedback",
  description:
    "Read genuine reviews and testimonials from students, parents, and industry professionals who attended Avinash Gore's workshops and read 'Come on... You can do it!'.",
  alternates: {
    canonical: "/reviews",
  },
  openGraph: {
    title: "Reviews & Testimonials | Avinash Gore",
    description:
      "Verified feedback and ratings on books, masterclasses, and career consulting.",
    url: "/reviews",
    images: [
      {
        url: "/images/image5.jpg",
        width: 800,
        height: 800,
        alt: "Avinash Gore Reviews & Testimonials",
      },
    ],
  },
};

export default function ReviewsLayout({ children }) {
  return children;
}
