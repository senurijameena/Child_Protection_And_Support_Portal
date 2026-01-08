
export interface ServiceOfferResponse {
  id: string;
  helpRequestId: string;
  workerId: string;
  serviceType: string;
  status: string;
  [key: string]: any;
}

export const serviceOfferService: {
  createServiceOffer: (offerData: any) => Promise<{ data: ServiceOfferResponse }>;
  getServiceOffer: (offerId: string) => Promise<{ data: ServiceOfferResponse }>;
  getOffersForUser: (userId: string) => Promise<{ data: ServiceOfferResponse[] }>;
  getPendingOffersForUser: (userId: string) => Promise<{ data: ServiceOfferResponse[] }>;
  getUpcomingServices: (userId: string) => Promise<{ data: ServiceOfferResponse[] }>;
  getOffersByWorker: (workerId: string) => Promise<{ data: ServiceOfferResponse[] }>;
  getOffersByHelpRequest: (helpRequestId: string) => Promise<{ data: ServiceOfferResponse[] }>;
  getOffersByType: (serviceType: string) => Promise<{ data: ServiceOfferResponse[] }>;
  respondToOffer: (responseData: any) => Promise<{ data: any }>;
  updateOfferStatus: (offerId: string, status: string) => Promise<{ data: any }>;
  cancelServiceOffer: (offerId: string) => Promise<{ data: any }>;
  searchAvailableRequests?: (params: any) => Promise<{ data: any[] }>;
};

