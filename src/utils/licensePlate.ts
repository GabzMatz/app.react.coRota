const BRAZIL_PLATE_REGEX = /^[A-Z]{3}[-\s]?([0-9]{4}|[0-9][A-Z][0-9]{2})$/i;

export const normalizeLicensePlate = (plate: string): string =>
  plate.replace(/[\s-]/g, '').toUpperCase();

export const isValidBrazilianLicensePlate = (plate: string): boolean => {
  const normalized = normalizeLicensePlate(plate);
  return normalized.length === 7 && BRAZIL_PLATE_REGEX.test(normalized);
};

export const formatLicensePlateInput = (value: string): string => {
  const raw = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 7);
  if (raw.length <= 3) {
    return raw;
  }
  return `${raw.slice(0, 3)}-${raw.slice(3)}`;
};

export const licensePlateValidationMessage =
  'Placa inválida. Use ABC1234 (antiga) ou ABC1D23 (Mercosul).';
