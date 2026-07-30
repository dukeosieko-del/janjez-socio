import FulfillmentClient from "./page-client";

export const dynamic = 'force-dynamic';

export default function ServiceFulfillmentPage({ params }: { params: { serviceId: string } }) {
  return <FulfillmentClient serviceId={params.serviceId} />;
}
