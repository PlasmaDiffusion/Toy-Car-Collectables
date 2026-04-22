export type Condition = "Mint in Box" | "Near Mint" | "Excellent" | "Good" | "Fair";

export type Scale = "1:18" | "1:24" | "1:43" | "1:64" | "1:87" | "Other";

export type VehicleType =
  | "Muscle Car"
  | "Sports Car"
  | "Race Car"
  | "Movie & TV"
  | "Truck & Van"
  | "Emergency Vehicle"
  | "Motorcycle"
  | "Classic";

export type Material = "Diecast" | "Plastic" | "Tin" | "Resin";

export type CategoryType =
  | "era"
  | "brand"
  | "scale"
  | "vehicleType"
  | "condition"
  | "material";

export interface ToyCarProduct {
  id: string;
  name: string;
  brand: string;
  /** Year this specific toy was manufactured */
  productionYear: number;
  /** Year of the real vehicle being modeled */
  modelYear: number;
  scale: Scale;
  condition: Condition;
  vehicleType: VehicleType;
  material: Material;
  /** Asking price in USD; null if price on request */
  price: number | null;
  images: string[];
  description: string;
  /** Direct link to a Facebook Marketplace listing; null means coming soon */
  facebookMarketplaceUrl: string | null;
  featured: boolean;
  categoryIds: string[];
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: CategoryType;
  description: string;
  imageUrl: string;
  /** Number of listings in this category */
  count: number;
}

export interface FilterState {
  brand?: string;
  era?: string;
  scale?: Scale;
  condition?: Condition;
  vehicleType?: VehicleType;
  material?: Material;
  minPrice?: number;
  maxPrice?: number;
  query?: string;
}
