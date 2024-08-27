export interface FormEnrolledModel {
  itemName: string;
}

export interface MasterDataModel {
  [key: string]: MasterDataDetailModel;
}

export interface MasterDataDetailModel {
  alatKesehatan: string;
  createdAt: string;
  enrolledKey: string;
  pricePerMonth: string;
  pricePerWeek: string;
  stock: string;
  borrowedCount: number;
  borrowed: string;
}
