export type PickupMode = 'meeting_point' | 'street_by_street';

export interface EmbarkMessageParams {
  pickupPlanConfigured?: boolean;
  pickupMode?: PickupMode;
  meetingPoint?: {
    street: string;
    city: string;
    state: string;
  } | null;
  passengerStreetAddress?: string;
}

export const getPassengerEmbarkMessage = ({
  pickupPlanConfigured,
  pickupMode,
  meetingPoint,
  passengerStreetAddress,
}: EmbarkMessageParams): string => {
  if (!pickupPlanConfigured) {
    return 'O motorista ainda não definiu o plano de embarque.';
  }

  if (pickupMode === 'street_by_street') {
    if (passengerStreetAddress?.trim()) {
      return `O motorista passará na sua rua (${passengerStreetAddress.trim()}).`;
    }
    return 'O motorista passará na sua rua.';
  }

  if (meetingPoint?.street) {
    return `Ponto de encontro: ${meetingPoint.street}, ${meetingPoint.city} - ${meetingPoint.state}.`;
  }

  return 'Ponto de encontro a combinar com o motorista.';
};
