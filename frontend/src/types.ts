export interface RouteRes {
  id: number;
  name: string;
  distanceMeters: number;
  public: boolean;
  createdAt?: string; // optional
}

export interface RouteCreateReq {
  name: string;
  distanceMeters: number;
  public: boolean;
  geomWkt: string;
}
