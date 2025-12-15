
import { Candidate, CandidateStatus, ScheduledEvent, EventType, Task, Template, TemplateType, Notification, ReferralSourceType, TaskStatus, KitItemType, AssignedKitItem, TalentPipelineEntry, TalentPipelineType, PaymentStatus, CostSettings } from '../types';

const MVM_LOGO_URL = 'https://mvm-ltd.co.uk/wp-content/themes/mvm-ltd/assets/images/mvm-logo.svg';

export const mockCostSettings: CostSettings = {
    // Individual Item Costs
    kitPoloShirt: 15,
    kitJacket: 40,
    kitHiVis: 10,
    kitTablet: 150,
    kitLanyard: 25,
    kitDashCam: 155,
    kitTradePlates: 180, // Replacement (Missing)
    kitFuelCard: 50,     // Replacement (Missing)
    
    // Additional Replacement Charges
    kitTradePlatesDamaged: 30,
    kitAACard: 50,
    kitUniform: 120, // Full uniform penalty
    insurance: 100,

    // Recurring
    kitFuelCardWeekly: 25,
    kitTradePlatesYearly: 2000,
    
    // Provider Fees
    tpjInductionFee: 150,
    tpjFinalFee: 150,
};

export const mockCandidates: Candidate[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '07123 456789',
    status: CandidateStatus.VIDEO_INTERVIEW,
    avatarUrl: MVM_LOGO_URL,
    lastContact: '2024-07-28',
    notes: [
      { id: 'n1', content: 'Initial screening call went well. Good experience with long-distance driving.', author: 'Admin', date: '2024-07-25T10:00:00Z' },
      { id: 'n2', content: 'Scheduled WhatsApp video call for technical interview.', author: 'Admin', date: '2024-07-26T14:30:00Z' }
    ],
    dateOfBirth: '1985-03-12',
    address: '123 Main Street, Anytown',
    postcode: 'AN1 2BC',
    licensePoints: 0,
    offRoadParking: true,
    referralSource: { type: ReferralSourceType.TPJ },
    providerCost: [
        { id: 'cost-1a', type: 'Induction Fee', amount: 150, status: PaymentStatus.PAID, paidAt: '2024-07-26T10:00:00Z' },
        { id: 'cost-1b', type: 'Final Fee', amount: 150, status: PaymentStatus.UNPAID }
    ],
    cvFilename: 'john_doe_cv.pdf',
    createdAt: '2024-07-25T09:00:00Z',
    keySkills: ['Long-Distance Driving', 'Vehicle Inspection', 'Customer Service', 'Route Planning', 'Logistics'],
    workHistorySummary: 'Experienced professional driver with over 10 years of experience in long-haul logistics and vehicle transportation. Proven ability to handle various vehicle types and maintain a clean driving record. Adept at customer relations and timely deliveries.',
    assignedKit: [
      { id: 'k1', type: KitItemType.TABLET, assignedAt: '2024-07-20T10:00:00Z' },
      { id: 'k2', type: KitItemType.FUEL_CARD, assignedAt: '2024-07-20T10:00:00Z', returnedAt: '2024-07-28T14:00:00Z' }
    ]
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '07987 654321',
    status: CandidateStatus.SCREENING,
    avatarUrl: MVM_LOGO_URL,
    lastContact: '2024-07-29',
    notes: [],
    dateOfBirth: '1992-08-21',
    address: '456 Oak Avenue, Someville',
    postcode: 'SV2 3DE',
    licensePoints: 3,
    offRoadParking: false,
    referralSource: { type: ReferralSourceType.WEBSITE },
    createdAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
  },
  {
    id: '3',
    name: 'Peter Jones',
    email: 'peter.jones@example.com',
    phone: '07777 123123',
    status: CandidateStatus.INDUCTION,
    avatarUrl: MVM_LOGO_URL,
    lastContact: '2024-07-27',
    notes: [
      { id: 'n3', content: 'Excellent interview, strong candidate. Proceeding to induction.', author: 'Admin', date: '2024-07-27T11:00:00Z' },
    ],
    dateOfBirth: '1988-11-02',
    address: '789 Pine Road, Cityburg',
    postcode: 'CB4 5FG',
    licensePoints: 0,
    offRoadParking: true,
    referralSource: { type: ReferralSourceType.STPJ },
    providerCost: [
        { id: 'cost-3a', type: 'Provider Fee', amount: 250, status: PaymentStatus.UNPAID }
    ],
    cvFilename: 'PeterJones_Resume.docx',
    createdAt: '2024-07-20T14:00:00Z',
  },
  {
    id: '4',
    name: 'Sarah Williams',
    email: 'sarah.williams@example.com',
    phone: '07555 444333',
    status: CandidateStatus.HIRED,
    avatarUrl: MVM_LOGO_URL,
    lastContact: '2024-07-20',
    notes: [
        { id: 'n4', content: 'Induction complete. Start date confirmed.', author: 'Admin', date: '2024-07-20T09:00:00Z' },
    ],
    dateOfBirth: '1995-01-30',
    address: '101 Maple Drive, Townsville',
    postcode: 'TS5 6GH',
    licensePoints: 0,
    offRoadParking: true,
    referralSource: { type: ReferralSourceType.REFERRAL, detail: 'John Doe' },
    createdAt: '2024-07-10T09:00:00Z',
    hiredAt: '2024-07-20T09:00:00Z',
  },
    {
    id: '5',
    name: 'Mike Brown',
    email: 'mike.brown@example.com',
    phone: '07444 555666',
    status: CandidateStatus.TERMINATED,
    avatarUrl: MVM_LOGO_URL,
    lastContact: '2024-07-22',
    notes: [
        { id: 'n5', content: 'Not enough experience with commercial vehicles. Rejected after first interview.', author: 'Admin', date: '2024-07-22T16:00:00Z' },
    ],
    dateOfBirth: '1980-06-15',
    address: '21 Birch Close, Villageton',
    postcode: 'VT6 7IJ',
    licensePoints: 6,
    offRoadParking: false,
    referralSource: { type: ReferralSourceType.OTHER, detail: 'Local newspaper ad' },
    createdAt: '2024-07-18T12:00:00Z',
    assignedKit: [
        { id: 'k3', type: KitItemType.TABLET, assignedAt: '2024-07-19T10:00:00Z'},
        { id: 'k4', type: KitItemType.TRADE_PLATES, assignedAt: '2024-07-19T10:00:00Z'},
        { id: 'k5', type: KitItemType.FUEL_CARD, assignedAt: '2024-07-19T10:00:00Z', returnedAt: '2024-07-22T15:00:00Z'},
        { id: 'k6', type: KitItemType.POLO_SHIRT, assignedAt: '2024-07-19T10:00:00Z', size: 'L' },
        { id: 'k7', type: KitItemType.HI_VIS, assignedAt: '2024-07-19T10:00:00Z', size: 'XL' }
    ]
  },
  {
    id: '6',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    phone: '07111 222333',
    status: CandidateStatus.WITHDRAWN,
    avatarUrl: MVM_LOGO_URL,
    lastContact: '2024-08-01',
    notes: [
        { id: 'n6', content: 'Candidate withdrew from process. Reason: Took another job', author: 'System', date: '2024-08-01T11:00:00Z' },
    ],
    dateOfBirth: '1991-04-25',
    address: '32 Willow Way, Riverdale',
    postcode: 'RD7 8KL',
    licensePoints: 0,
    offRoadParking: true,
    referralSource: { type: ReferralSourceType.WEBSITE },
    createdAt: '2024-07-28T10:00:00Z',
  }
];

const today = new Date();
const todayString = today.toISOString().split('T')[0];

export const mockEvents: ScheduledEvent[] = [
  {
    id: 'e1',
    title: 'Video Interview with John Doe',
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 30), // Today at 10:30
    type: EventType.VIDEO_CALL,
    candidateId: '1',
    description: 'Technical interview to discuss long-distance driving experience.'
  },
  {
    id: 'e2',
    title: 'Induction confirmation for Peter Jones',
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 14, 0),
    type: EventType.PHONE_CALL,
    candidateId: '3',
    description: 'Discuss start date and induction details.'
  },
  {
    id: 'e3',
    title: 'Screening call with Jane Smith',
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0), // Today at 14:00
    type: EventType.PHONE_CALL,
    candidateId: '2',
    description: 'Initial 15-minute screening call.'
  },
  {
    id: 'e4',
    title: 'Induction for Sarah Williams',
    date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0), // Today at 09:00
    type: EventType.INDUCTION,
    candidateId: '4',
    description: 'Onboarding and induction session.'
  },
];

export const mockTasks: Task[] = [
    { id: 't1', title: 'Confirm induction slot for Peter Jones', dueDate: todayString, status: TaskStatus.TO_DO, candidateId: '3', history: [] },
    { id: 't2', title: 'Prepare for John Doe video interview', dueDate: '2024-08-01', status: TaskStatus.IN_PROGRESS, candidateId: '1', history: [] },
    { id: 't3', title: 'Review new applications', dueDate: todayString, status: TaskStatus.DONE, candidateId: '', history: []},
    { 
      id: 't5', 
      title: 'Initial candidate screening', 
      dueDate: '2024-07-20', 
      status: TaskStatus.ARCHIVED, 
      candidateId: '', 
      archivedAt: '2024-07-28T10:00:00Z', 
      archivedBy: 'Admin',
      history: [
          { timestamp: '2024-07-27T14:00:00Z', user: 'Admin', fromStatus: TaskStatus.IN_PROGRESS, toStatus: TaskStatus.DONE },
          { timestamp: '2024-07-28T10:00:00Z', user: 'Admin', fromStatus: TaskStatus.DONE, toStatus: TaskStatus.ARCHIVED }
      ]
    },
];

export const mockTemplates: Template[] = [
    {
        id: 'tpl-email-1',
        name: 'Interview Invitation',
        type: TemplateType.EMAIL,
        subject: 'Invitation to Video Interview for Trade Plate Driver Position',
        content: `Hi {candidateName},\n\nThank you for your interest in the Trade Plate Driver position.\n\nWe were impressed with your application and would like to invite you for a video interview to discuss your experience further.\n\nPlease let us know what times work best for you in the coming days.\n\nBest regards,\nRecruitment Team`,
    },
    {
        id: 'tpl-email-5',
        name: 'Re-engagement Follow-up',
        type: TemplateType.EMAIL,
        subject: 'Following Up: Trade Plate Driver Opportunities',
        content: `Hi {candidateName},\n\nHope you're doing well.\n\nWe spoke a few months ago about a Trade Plate Driver position. I wanted to reach out again to see if you might be open to new opportunities, as we have some new openings.\n\nWould you be available for a brief chat sometime soon to catch up?\n\nBest regards,\nRecruitment Team`,
    },
    {
        id: 'tpl-email-2',
        name: 'Rejection Post-Interview',
        type: TemplateType.EMAIL,
        subject: 'Update on Your Application for Trade Plate Driver',
        content: `Hi {candidateName},\n\nThank you for taking the time to interview with us for the Trade Plate Driver position.\n\nWhile we were impressed with your qualifications, we have decided to move forward with another candidate whose experience is a closer match for this role.\n\nWe appreciate your interest and wish you the best of luck in your job search.\n\nBest regards,\nRecruitment Team`,
    },
    {
        id: 'tpl-email-3',
        name: 'Induction Invitation',
        type: TemplateType.EMAIL,
        subject: 'Induction Invitation: Trade Plate Driver',
        content: `Hi {candidateName},\n\nWe are delighted to invite you to our induction day for the Trade Plate Driver position!\n\nWe were very impressed during the interview process and believe you will be a great addition to our team.\n\nFurther details about the induction are attached. Please let us know if you have any questions.\n\nBest regards,\nRecruitment Team`,
    },
    {
        id: 'tpl-email-4',
        name: 'Termination',
        type: TemplateType.EMAIL,
        subject: 'Private and Confidential: Termination of Driver Supplier Statement for {candidateName}',
        content: `Private and Confidential

Dear {candidateName},
This email serves as formal written notification regarding the termination of your Driver Supplier Statement with MVM/SDL (Simply Driven Logistics).

1. Effective Date of Termination
Your Driver Supplier Statement is terminated with effect from {currentDate}.
• Basis for Termination: {terminationReason}

2. Mandatory Return of Company Property
You have a mandatory contractual obligation to return all company property, loaned to you for the purposes of completing the Driver Supplier Statement, within three (3) working days of the termination date.
Property must be returned to the following address in good working order:
Simply Driven Logistics, 21 Church Street, Oadby, Leicester, LE2 5DB.
 
Property Replacement Charges (Deducted from Final Payment):
Deductions will be made from your final payments for any non-returned or damaged company property. Please note the replacement charges below:
• Trade Plate(s) (Missing): £180 (and reported to DVLA as stolen)
• Trade Plate(s) (Damaged): £30
• Tablet, Charger, & Case: £150
• Dash Cam Kit (Entire Kit): £155
• Fuel Card(s): £50
• Uniform: £120
• AA Card: £50
• ID Lanyard: £25
 
3. Financial Penalties for Non-Return
• Trade Plates: Failure to return the trade plates within three (3) business days will result in a daily charge of £80.00 applied for up to 120 days to cover lost revenue.
• Final Payments: Non-return of company property will result in the replacement value of the items being withheld.
• Deemed Retention: If property is not received within one calendar month from the termination date, it will be deemed you have chosen to keep the item(s), and no further payments will be made (unless by prior agreement with the Director).
• Couriers: If property is returned via courier, the business will determine its condition upon receipt.
 
4. Outstanding Work and Financial Liability (Driver-Initiated Termination)
If you initiated the termination of the Driver Supplier Statement:
• Work Liability: You may be held liable for any work already accepted which you do not fulfil.
• Notice Period Penalty: If you withdraw without providing five (5) days’ clear notice (excluding weekends), a charge equal to the current day rate for MVM/SDL being unable to fulfil their client obligations may be made against monies owed to you.
 
5. Final Payment Processing & Loans
• Withholding: Any outstanding monies from your final payment(s) will be withheld until all company property has been received and accounted for.
• Payment Date: Provided all relevant paperwork (invoices, proof of delivery, etc.) has been sent and received, your outstanding invoices will be paid on the following payment date as per standard payment terms: the 1st or 16th of the month.
 
Please ensure all obligations detailed above are met to avoid delays or deductions from your final payment.
Regards,`,
    },
    {
        id: 'tpl-email-cv-request',
        name: 'CV Request & Info',
        type: TemplateType.EMAIL,
        subject: 'Opportunity: Self-Employed Trade Plate Driver with Simply Driven Logistics',
        content: `Dear {candidateName},

I am getting in touch to discuss an opportunity to become a Self-Employed Trade Plate Driver with Simply Driven Logistics, part of the MVM group. MVM represents both Simply Driven Logistics and Merseyside Vehicle Movements Limited, which are owned and operated under the same leadership and brand identity.

As an award-winning group, we pride ourselves on excellence in the vehicle coordination industry. We've been recognised as the best national vehicle delivery partner and best new and used vehicle movements specialists in Northwest England for multiple years.

We believe this success stems from our commitment to our team—our planners either have on-the-road experience or over five years in the industry, meaning they understand the challenges and demands of your role.
Unlike companies that offer a fixed fee per vehicle or a low hourly rate, we operate a profit-sharing model. This means the better a job performs, the more you earn. We believe this is the fairest way to reward your professionalism and efficiency; your success is our success.

Other models often rely on hidden costs that reduce your earnings. For example:
•	Charging a daily fee for trade plates (e.g., £5/day)
•	Requiring deposits or charging for insurance
•	Offering low waiting time rates (as little as £3.50/hour)

At MVM, we believe in complete transparency. Every job comes with a clear breakdown of its value and whether fuel is included—both on the job assignment and in a confirming email. We provide full support, including all necessary equipment and insurance, and we pay £15/hour for waiting time, ensuring your time is always valued.

We also understand that starting out can come with financial challenges. That’s why, after your first 10 days, if needed, we can arrange an advance against your expenses through our accounts department.
We’re confident that our profit-sharing model and commitment to transparency make MVM a standout choice for professional drivers looking for a genuinely rewarding career.
If this sounds like the opportunity you're looking for, please reply to this email with your CV. We look forward to the possibility of you joining our team.

Kind regards,`,
    },
    {
        id: 'tpl-whatsapp-1',
        name: 'Quick Availability Check',
        type: TemplateType.WHATSAPP,
        content: `Hi {candidateName}, thanks for your application. Are you free for a quick chat about the Trade Plate Driver role sometime this week?`,
    },
    {
        id: 'tpl-whatsapp-2',
        name: 'Interview Confirmation',
        type: TemplateType.WHATSAPP,
        content: `Hi {candidateName}, just confirming your video interview for the Trade Plate Driver role tomorrow at [Time]. Looking forward to speaking with you!`,
    }
];

export const generateMockNotifications = (tasks: Task[], events: ScheduledEvent[], candidates: Candidate[]): Notification[] => {
    const notifications: Notification[] = [];
    const todayStr = new Date().toDateString();

    events.forEach(event => {
        if (event.date.toDateString() === todayStr) {
            const candidate = candidates.find(c => c.id === event.candidateId);
            notifications.push({
                id: `notif-e-${event.id}`,
                message: `${event.type} with ${candidate?.name || 'a candidate'} is scheduled for today.`,
                candidateId: event.candidateId,
                createdAt: new Date(),
                read: false,
            });
        }
    });

    tasks.forEach(task => {
        const dueDate = new Date(task.dueDate + 'T00:00:00'); // Ensure we are comparing dates only
        if (dueDate.toDateString() === todayStr && task.status !== TaskStatus.DONE && task.status !== TaskStatus.ARCHIVED) {
            const candidate = candidates.find(c => c.id === task.candidateId);
            const message = candidate 
                ? `Task due today: ${task.title} for ${candidate.name}.`
                : `Task due today: ${task.title}.`;
            notifications.push({
                id: `notif-t-${task.id}`,
                message,
                candidateId: task.candidateId || undefined,
                createdAt: new Date(),
                read: Math.random() > 0.5, // Randomly mark some as read for demo
            });
        }
    });

    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

const threeMonthsFromNow = new Date();
threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

const sixMonthsFromNow = new Date();
sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);

export const mockTalentPipeline: TalentPipelineEntry[] = [
    {
        candidateId: '6',
        addedAt: '2024-08-01T11:00:00Z',
        followUpOn: threeMonthsFromNow.toISOString(),
        type: TalentPipelineType.RE_ENGAGE,
    },
    {
        candidateId: '5',
        addedAt: '2024-07-22T16:00:00Z',
        followUpOn: sixMonthsFromNow.toISOString(),
        type: TalentPipelineType.RECONSIDER,
        notes: 'Good attitude, but lacked specific commercial vehicle experience. Reconsider if a junior role opens up.'
    }
];

export const mockNotifications = generateMockNotifications(mockTasks, mockEvents, mockCandidates);
