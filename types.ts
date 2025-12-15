
export enum CandidateStatus {
  NEW = 'New',
  SCREENING = 'Screening',
  VIDEO_INTERVIEW = 'Video Interview',
  INDUCTION = 'Induction',
  HIRED = 'Hired',
  REJECTED = 'Rejected',
  LEGACY = 'Legacy',
  TERMINATED = 'Terminated',
  WITHDRAWN = 'Withdrawn',
}

export enum ReferralSourceType {
  WEBSITE = 'Website',
  TPJ = 'TPJ',
  STPJ = 'STPJ',
  REFERRAL = 'Referral',
  COLD_CALL = 'Cold Call',
  OTHER = 'Other',
}

export enum TerminationReasonType {
  REJECTION_OF_WORK = 'Rejection of work',
  FAILED_BACKGROUND_CHECK = 'Failed background check',
  NO_SHOW = 'No-show for assignment',
  POOR_PERFORMANCE = 'Poor performance',
  VOLUNTARY_RESIGNATION = 'Voluntary resignation',
  TOOK_ANOTHER_JOB = 'Took another job',
  OTHER = 'Other',
}

export enum WithdrawalReasonType {
  TOOK_ANOTHER_JOB = 'Took another job',
  NO_LONGER_INTERESTED = 'No longer interested',
  UNRESPONSIVE = 'Unresponsive',
  OTHER = 'Other',
}


export interface ReferralSource {
  type: ReferralSourceType;
  detail?: string;
}

export enum KitItemType {
  TABLET = 'Tablet',
  DASHCAM = 'Dashcam',
  FUEL_CARD = 'Fuel Card',
  POLO_SHIRT = 'Polo Shirt',
  JACKET = 'Jacket',
  HI_VIS = 'Hi-Vis Vest',
  ID_CARD_LANYARD = 'ID Card & Lanyard',
  TRADE_PLATES = 'Trade Plates',
}

export interface AssignedKitItem {
  id: string;
  type: KitItemType;
  assignedAt: string;
  returnedAt?: string;
  size?: string; // e.g., 'M', 'L', 'XL'
  plateNumber?: string;
  fuelCardNumber?: string; // Last 4 digits
  tabletImei?: string;
  simNumber?: string;
  simProvider?: 'O2' | 'Vodafone' | string;
}

export enum PaymentStatus {
  UNPAID = 'Unpaid',
  PAID = 'Paid',
}

export interface CostPart {
  id: string;
  type: string; // e.g., 'Induction Fee', 'Final Fee', 'Provider Fee'
  amount: number;
  status: PaymentStatus;
  paidAt?: string;
}

export interface CostSettings {
    // Kit Issue Values (Individual Item Costs)
    kitPoloShirt: number;
    kitJacket: number;
    kitHiVis: number;
    kitTablet: number;
    kitLanyard: number;
    kitDashCam: number;
    kitTradePlates: number; // Replacement if missing
    kitFuelCard: number; // Replacement if missing
    
    // Additional Replacement Charges (Specific to Termination)
    kitTradePlatesDamaged: number;
    kitAACard: number;
    kitUniform: number; // Full uniform replacement charge
    insurance: number;
    
    // Recurring Costs
    kitFuelCardWeekly: number;
    kitTradePlatesYearly: number;
    
    // Provider Fees
    tpjInductionFee: number;
    tpjFinalFee: number;
}

export interface ScreeningRatings {
    financialViability: number; // 1-5
    logisticsAvailability: number; // 1-5
    complianceTech: number; // 1-5
    attitudeExperience: number; // 1-5
    completed?: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: CandidateStatus;
  avatarUrl: string;
  lastContact: string;
  notes: Note[];
  dateOfBirth: string;
  address: string;
  postcode: string;
  licensePoints: number;
  offRoadParking: boolean;
  referralSource?: ReferralSource;
  cvFilename?: string;
  createdAt: string;
  hiredAt?: string;
  keySkills?: string[];
  workHistorySummary?: string;
  assignedKit?: AssignedKitItem[];
  providerCost?: CostPart[];
  screeningRatings?: ScreeningRatings;
}

export interface Note {
  id: string;
  content: string;
  date: string;
  author: string;
}

export enum EventType {
  PHONE_CALL = 'Phone Call',
  VIDEO_CALL = 'Video Call',
  ONSITE_INTERVIEW = 'On-site Interview',
  FOLLOW_UP = 'Follow-up',
  INDUCTION = 'Induction',
}

export interface ScheduledEvent {
  id: string;
  title: string;
  date: Date;
  type: EventType;
  candidateId: string;
  description?: string;
}

export enum TaskStatus {
  TO_DO = 'To Do',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done',
  ARCHIVED = 'Archived',
}

export interface TaskHistoryEntry {
    timestamp: string;
    user: string;
    fromStatus: TaskStatus | null;
    toStatus: TaskStatus;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: TaskStatus;
  candidateId: string;
  archivedAt?: string;
  archivedBy?: string;
  history: TaskHistoryEntry[];
}

export enum TemplateType {
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
}

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  content: string;
  subject?: string;
}

export type View = 'dashboard' | 'tasks' | 'candidates' | 'diary' | 'candidate-detail' | 'maintenance' | 'email' | 'reporting' | 'talent-pipeline';

export interface Notification {
  id: string;
  message: string;
  candidateId?: string;
  createdAt: Date;
  read: boolean;
  actionLink?: View;
}

export interface CsvPreviewData {
  newCandidates: Candidate[];
  duplicateCandidates: Candidate[];
  invalidRows: any[];
}

export enum TalentPipelineType {
  RE_ENGAGE = 'Re-engage',
  RECONSIDER = 'Reconsider',
}

export interface TalentPipelineEntry {
  candidateId: string;
  addedAt: string;
  followUpOn: string;
  type: TalentPipelineType;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Recruiter' | 'Viewer';
  avatarUrl: string;
}

export type Theme = 'light' | 'dark';
