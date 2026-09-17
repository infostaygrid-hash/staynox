import { getPropertyBySlug } from '@/app/data/properties';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return {
      title: 'Property Not Found | StayNox',
      description: 'The property you are looking for does not exist.'
    };
  }

  const lowestPrice = property.price?.triple || property.price?.double || property.price?.single || 'N/A';
  const billingSuffix = property.billing_cycle === 'yearly' ? '/yr' : '/mo';

  return {
    title: `${property.name} | ${property.type.toUpperCase()} in ${property.area} | StayNox`,
    description: `Book ${property.name} in ${property.area}, ${property.city}. Premium ${property.gender} ${property.type} starting at ₹${lowestPrice}${billingSuffix}.`,
    openGraph: {
      images: [property.images[0] || '/images/greater_noida_cityscape.jpg'],
    },
  };
}

export default function PropertyLayout({ children }) {
  return <>{children}</>;
}
