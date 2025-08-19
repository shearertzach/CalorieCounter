// Unit conversion utilities for imperial/metric system

export type UnitSystem = 'metric' | 'imperial';

// Weight conversions
export const convertWeight = {
  kgToLb: (kg: number): number => kg * 2.20462,
  lbToKg: (lb: number): number => lb / 2.20462,
  gToOz: (g: number): number => g * 0.035274,
  ozToG: (oz: number): number => oz / 0.035274,
};

// Height conversions
export const convertHeight = {
  cmToFtIn: (cm: number): { feet: number; inches: number } => {
    const totalInches = cm * 0.393701;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round((totalInches % 12) * 10) / 10; // Round to 1 decimal
    return { feet, inches };
  },
  ftInToCm: (feet: number, inches: number): number => {
    return Math.round((feet * 12 + inches) * 2.54 * 10) / 10; // Round to 1 decimal
  },
};

// Format weight display
export const formatWeight = (weight: number, unitSystem: UnitSystem): string => {
  if (unitSystem === 'imperial') {
    return `${Math.round(convertWeight.kgToLb(weight) * 10) / 10} lb`;
  }
  return `${weight} kg`;
};

// Format height display
export const formatHeight = (heightCm: number, unitSystem: UnitSystem): string => {
  if (unitSystem === 'imperial') {
    const { feet, inches } = convertHeight.cmToFtIn(heightCm);
    return `${feet}'${inches}"`;
  }
  return `${heightCm} cm`;
};

// Format nutrition values (for food items)
export const formatNutritionWeight = (grams: number, unitSystem: UnitSystem, largeUnit = false): string => {
  if (unitSystem === 'imperial') {
    if (largeUnit && grams >= 28.35) { // Use oz for values >= 1 oz
      return `${Math.round(convertWeight.gToOz(grams) * 10) / 10} oz`;
    }
    return `${grams} g`; // Still show grams for small amounts in imperial
  }
  return `${grams} g`;
};

// Get weight unit label
export const getWeightUnit = (unitSystem: UnitSystem): string => {
  return unitSystem === 'imperial' ? 'lb' : 'kg';
};

// Get height unit labels
export const getHeightUnits = (unitSystem: UnitSystem): { primary: string; secondary?: string } => {
  if (unitSystem === 'imperial') {
    return { primary: 'ft', secondary: 'in' };
  }
  return { primary: 'cm' };
};

// Parse height input for imperial system
export const parseHeightInput = (feet: string, inches: string): number | undefined => {
  const feetNum = parseInt(feet) || 0;
  const inchesNum = parseFloat(inches) || 0;
  
  if (feetNum < 0 || inchesNum < 0 || inchesNum >= 12) {
    return undefined;
  }
  
  return convertHeight.ftInToCm(feetNum, inchesNum);
};

// Parse weight input for imperial system
export const parseWeightInput = (weight: string, unitSystem: UnitSystem): number | undefined => {
  const weightNum = parseFloat(weight);
  if (isNaN(weightNum) || weightNum <= 0) {
    return undefined;
  }
  
  if (unitSystem === 'imperial') {
    return convertWeight.lbToKg(weightNum);
  }
  
  return weightNum;
};

// Get display values for form inputs
export const getDisplayWeight = (weightKg: number | undefined, unitSystem: UnitSystem): string => {
  if (!weightKg) return '';
  
  if (unitSystem === 'imperial') {
    return (Math.round(convertWeight.kgToLb(weightKg) * 10) / 10).toString();
  }
  
  return weightKg.toString();
};

export const getDisplayHeight = (heightCm: number | undefined, unitSystem: UnitSystem): { feet: string; inches: string; cm: string } => {
  if (!heightCm) {
    return { feet: '', inches: '', cm: '' };
  }
  
  if (unitSystem === 'imperial') {
    const { feet, inches } = convertHeight.cmToFtIn(heightCm);
    return { 
      feet: feet.toString(), 
      inches: inches.toString(), 
      cm: heightCm.toString() 
    };
  }
  
  return { feet: '', inches: '', cm: heightCm.toString() };
};