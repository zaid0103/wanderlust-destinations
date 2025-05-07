import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import axios from 'axios';
import BookingForm from '@/components/BookingForm';

const PropertyPage = () => {
  const router = useRouter();
  const { propertyId } = router.query;
  const [property, setProperty] = useState(null);

  useEffect(() => {
    if (propertyId) {
      axios.get(`/api/properties/${propertyId}`).then((response) => {
        setProperty(response.data);
      });
    }
  }, [propertyId]);

  if (!property) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{property.name}</h1>
      <p>{property.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p>Price: ${property.price}</p>
          <p>Location: {property.location}</p>
          <p>Bedrooms: {property.bedrooms}</p>
          <p>Bathrooms: {property.bathrooms}</p>
        </div>
        <div className="mt-6">
          <BookingForm price={property.price} propertyId={property.id} />
        </div>
      </div>
    </div>
  );
};

export default PropertyPage;