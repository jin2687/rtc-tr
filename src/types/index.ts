export interface Location {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface Member {
  id: string;
  name: string;
  location: Location | null;
  heading: number | null;
}

export interface Message {
  type: 'location' | 'member-info' | 'all-members';
  data: {
    id?: string;
    name?: string;
    location?: Location | null;
    heading?: number | null;
    members?: Member[];
  };
}

export type Role = 'host' | 'client';

export interface AppState {
  role: Role | null;
  username: string;
  peerId: string | null;
  hostId: string | null;
  members: Member[];
  myLocation: Location | null;
  myHeading: number | null;
  isCompassPermissionGranted: boolean;
}
