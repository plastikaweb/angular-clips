import { Timestamp } from "@angular/fire/firestore";

export interface Clip {
  uid: string;
  displayName: string;
  title: string;
  fileName: string;
  clipUrl: string;  
  timestamp: Timestamp;
}
