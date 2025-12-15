
import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { Candidate, ScheduledEvent, Task, Note, CandidateStatus, Template, Notification, TaskStatus, KitItemType, AssignedKitItem, WithdrawalReasonType, TalentPipelineEntry, TalentPipelineType, PaymentStatus, ReferralSourceType, CostSettings, ScreeningRatings, User, Theme } from '../types';
import { mockCandidates, mockEvents, mockTasks, mockTemplates, mockNotifications, mockTalentPipeline, mockCostSettings } from '../data/mockData';

const STORAGE_KEY = 'recruitment_hub_db_v1';

interface AppState {
  candidates: Candidate[];
  events: ScheduledEvent[];
  tasks: Task[];
  templates: Template[];
  notifications: Notification[];
  selectedCandidate: Candidate | null;
  talentPipeline: TalentPipelineEntry[];
  costSettings: CostSettings;
  currentUser: User | null;
  theme: Theme;
  isCalendarSynced: boolean;
  hasSeenOnboarding: boolean;
}

type Action =
  | { type: 'SELECT_CANDIDATE'; payload: Candidate | null }
  | { type: 'UPDATE_CANDIDATE'; payload: Candidate }
  | { type: 'UPDATE_CANDIDATE_STATUS'; payload: { candidateId: string; status: CandidateStatus } }
  | { type: 'WITHDRAW_CANDIDATE'; payload: { candidateId: string; reason: string } }
  | { type: 'ADD_NOTE'; payload: { candidateId: string; note: Note } }
  | { type: 'ADD_CANDIDATE'; payload: Candidate }
  | { type: 'ADD_CANDIDATES'; payload: Candidate[] }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'RESTORE_STATE'; payload: { candidates: Candidate[]; events: ScheduledEvent[]; tasks: Task[] } }
  | { type: 'UPDATE_CANDIDATE_AVATAR'; payload: { candidateId: string; avatarUrl: string } }
  | { type: 'UPDATE_TASK_STATUS'; payload: { taskId: string; status: TaskStatus } }
  | { type: 'BULK_UPDATE_CANDIDATE_STATUS'; payload: { candidateIds: string[]; status: CandidateStatus } }
  | { type: 'ARCHIVE_COMPLETED_TASKS' }
  | { type: 'RESTORE_TASK'; payload: { taskId: string } }
  | { type: 'ADD_EVENT'; payload: ScheduledEvent }
  | { type: 'UPDATE_EVENT'; payload: ScheduledEvent }
  | { type: 'DELETE_EVENT'; payload: string }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'ADD_TEMPLATE'; payload: Template }
  | { type: 'UPDATE_TEMPLATE'; payload: Template }
  | { type: 'DELETE_TEMPLATE'; payload: string }
  | { type: 'MERGE_CANDIDATES'; payload: { masterCandidateId: string; duplicateCandidateIds: string[] } }
  | { type: 'UPDATE_CANDIDATE_KIT'; payload: { candidateId: string; kit: Partial<AssignedKitItem>[] } }
  | { type: 'MARK_KIT_RETURNED'; payload: { candidateId: string; kitItemId: string } }
  | { type: 'BULK_ADD_NOTE'; payload: { candidateIds: string[]; note: Omit<Note, 'id'> } }
  | { type: 'ADD_TO_PIPELINE'; payload: Omit<TalentPipelineEntry, 'addedAt'> }
  | { type: 'PROCESS_PIPELINE_CANDIDATE'; payload: { candidateId: string } }
  | { type: 'MARK_COST_PAID'; payload: { candidateId: string; costId: string } }
  | { type: 'UPDATE_COST_SETTINGS'; payload: CostSettings }
  | { type: 'UPDATE_CANDIDATE_RATING'; payload: { candidateId: string; ratings: ScreeningRatings } }
  | { type: 'LOGIN'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_CALENDAR_SYNC'; payload: boolean }
  | { type: 'COMPLETE_ONBOARDING' };


const initialState: AppState = {
  candidates: mockCandidates,
  events: mockEvents,
  tasks: mockTasks,
  templates: mockTemplates,
  notifications: mockNotifications,
  selectedCandidate: null,
  talentPipeline: mockTalentPipeline,
  costSettings: mockCostSettings,
  currentUser: null,
  theme: 'light',
  isCalendarSynced: false,
  hasSeenOnboarding: false,
};

// Helper to hydrate state from LocalStorage
const loadState = (): AppState => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return initialState;
    }
    const parsedState = JSON.parse(serializedState);
    
    // Hydration: Convert ISO strings back to Date objects where required
    // 1. Events (strictly Date objects)
    if (parsedState.events) {
        parsedState.events = parsedState.events.map((e: any) => ({
            ...e,
            date: new Date(e.date)
        }));
    }

    // 2. Notifications (strictly Date objects for sorting/timeSince)
    if (parsedState.notifications) {
        parsedState.notifications = parsedState.notifications.map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt)
        }));
    }

    // Ensure costSettings exist
    if (!parsedState.costSettings) {
        parsedState.costSettings = mockCostSettings;
    }
    
    // Ensure theme/sync/onboarding defaults exist
    if (!parsedState.theme) parsedState.theme = 'light';
    if (parsedState.isCalendarSynced === undefined) parsedState.isCalendarSynced = false;
    if (parsedState.hasSeenOnboarding === undefined) parsedState.hasSeenOnboarding = false;

    return { ...initialState, ...parsedState };
  } catch (err) {
    console.error("Failed to load state from local storage", err);
    return initialState;
  }
};

// Helper to create automated tasks
const createAutomatedTask = (candidateId: string, title: string, daysToAdd: number): Task => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysToAdd);
    return {
        id: `t-${Date.now()}-${Math.random()}`,
        title,
        dueDate: dueDate.toISOString().split('T')[0],
        status: TaskStatus.TO_DO,
        candidateId,
        history: [],
    };
};

const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOGIN':
        return { ...state, currentUser: action.payload };
    case 'LOGOUT':
        return { ...state, currentUser: null };
    case 'TOGGLE_THEME':
        return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };
    case 'SET_CALENDAR_SYNC':
        return { ...state, isCalendarSynced: action.payload };
    case 'COMPLETE_ONBOARDING':
        return { ...state, hasSeenOnboarding: true };
    case 'SELECT_CANDIDATE':
      return { ...state, selectedCandidate: action.payload };
    case 'UPDATE_CANDIDATE': {
        const updatedCandidate = action.payload;
        return {
            ...state,
            candidates: state.candidates.map(c => c.id === updatedCandidate.id ? updatedCandidate : c),
            selectedCandidate: state.selectedCandidate?.id === updatedCandidate.id ? updatedCandidate : state.selectedCandidate,
        };
    }
    case 'UPDATE_CANDIDATE_STATUS': {
      const { candidateId, status } = action.payload;
      let newTasks = [...state.tasks];
      let newNotifications = [...state.notifications];
      
      const existingCandidate = state.candidates.find(c => c.id === candidateId);
      if (existingCandidate && existingCandidate.status !== status) {
          switch(status) {
              case CandidateStatus.SCREENING:
                   newTasks.push(createAutomatedTask(candidateId, `Complete screening call for ${existingCandidate.name}`, 1));
                   break;
              case CandidateStatus.VIDEO_INTERVIEW:
                  newTasks.push(createAutomatedTask(candidateId, `Schedule video interview for ${existingCandidate.name}`, 2));
                  break;
              case CandidateStatus.INDUCTION:
                  newTasks.push(createAutomatedTask(candidateId, `Confirm induction details for ${existingCandidate.name}`, 3));
                  break;
              case CandidateStatus.HIRED:
                  newTasks.push(createAutomatedTask(candidateId, `Finalise onboarding for ${existingCandidate.name}`, 1));
                  if (existingCandidate.referralSource?.type === ReferralSourceType.TPJ) {
                      newTasks.push(createAutomatedTask(candidateId, `Pay TPJ Final Fee for ${existingCandidate.name}`, 14));
                  }
                  break;
          }
          
          // Generate notification
          newNotifications.unshift({
              id: `notif-${Date.now()}`,
              message: `${existingCandidate.name} moved to ${status}`,
              candidateId: existingCandidate.id,
              createdAt: new Date(),
              read: false,
              actionLink: 'candidate-detail'
          });
      }
      
      const updatedCandidates = state.candidates.map(c => {
        if (c.id === candidateId) {
            const updatedCandidate = { ...c, status: status };
            if (status === CandidateStatus.HIRED && !c.hiredAt) {
                updatedCandidate.hiredAt = new Date().toISOString();
            } else if (status !== CandidateStatus.HIRED) {
                delete updatedCandidate.hiredAt;
            }
            return updatedCandidate;
        }
        return c;
      });

      return {
        ...state,
        tasks: newTasks,
        notifications: newNotifications,
        candidates: updatedCandidates,
        selectedCandidate: state.selectedCandidate?.id === candidateId
          ? updatedCandidates.find(c => c.id === candidateId) || null
          : state.selectedCandidate,
      };
    }
    case 'WITHDRAW_CANDIDATE': {
        const { candidateId, reason } = action.payload;
        let newTalentPipeline = [...state.talentPipeline];
        let newNotifications = [...state.notifications];
        
        const candidate = state.candidates.find(c => c.id === candidateId);
        if (!candidate) return state;

        if (reason === WithdrawalReasonType.TOOK_ANOTHER_JOB) {
            const reengageDate = new Date();
            reengageDate.setMonth(reengageDate.getMonth() + 3);
            
            const newEntry: TalentPipelineEntry = {
                candidateId: candidate.id,
                addedAt: new Date().toISOString(),
                followUpOn: reengageDate.toISOString(),
                type: TalentPipelineType.RE_ENGAGE,
            };
            // Avoid duplicates
            if (!newTalentPipeline.some(e => e.candidateId === candidate.id)) {
                 newTalentPipeline.push(newEntry);
            }
        }

        const withdrawalNote: Note = {
            id: `n-${Date.now()}`,
            content: `Candidate withdrew from process. Reason: ${reason}`,
            author: 'System',
            date: new Date().toISOString(),
        };
        
        // Generate Notification
        newNotifications.unshift({
            id: `notif-wd-${Date.now()}`,
            message: `${candidate.name} has withdrawn: ${reason}`,
            candidateId: candidate.id,
            createdAt: new Date(),
            read: false,
            actionLink: 'candidate-detail'
        });

        const updatedCandidates = state.candidates.map(c => 
            c.id === candidateId 
            ? { ...c, status: CandidateStatus.WITHDRAWN, notes: [withdrawalNote, ...c.notes] }
            : c
        );

        return {
            ...state,
            talentPipeline: newTalentPipeline,
            notifications: newNotifications,
            candidates: updatedCandidates,
            selectedCandidate: state.selectedCandidate?.id === candidateId
                ? updatedCandidates.find(c => c.id === candidateId) || null
                : state.selectedCandidate,
        };
    }
    case 'ADD_TO_PIPELINE': {
      const { candidateId, followUpOn, type, notes } = action.payload;
      
      const newEntry: TalentPipelineEntry = {
        candidateId,
        addedAt: new Date().toISOString(),
        followUpOn,
        type,
        notes,
      };
      
      const noteContent = `Added to Talent Pipeline for Reconsideration on ${new Date(followUpOn).toLocaleDateString('en-GB')}. Reason: ${notes}`;
      const newNote: Note = {
          id: `n-${Date.now()}`,
          content: noteContent,
          author: 'System',
          date: new Date().toISOString(),
      };

      const newTalentPipeline = [newEntry, ...state.talentPipeline].filter((entry, index, self) => 
          index === self.findIndex(t => t.candidateId === entry.candidateId)
      );

      return {
        ...state,
        talentPipeline: newTalentPipeline,
        candidates: state.candidates.map(c => c.id === candidateId ? { ...c, notes: [newNote, ...c.notes] } : c),
      };
    }
    case 'PROCESS_PIPELINE_CANDIDATE': {
        const { candidateId } = action.payload;
        const entry = state.talentPipeline.find(e => e.candidateId === candidateId);
        if (!entry) return state;

        const noteContent = entry.type === TalentPipelineType.RE_ENGAGE
            ? 'Candidate re-engaged from Talent Pipeline. Status changed to Screening.'
            : 'Candidate reviewed from Talent Pipeline.';
        
        const note: Note = {
            id: `n-${Date.now()}`,
            content: noteContent,
            author: 'System',
            date: new Date().toISOString(),
        };

        return {
            ...state,
            talentPipeline: state.talentPipeline.filter(e => e.candidateId !== candidateId),
            candidates: state.candidates.map(c => {
                if (c.id === candidateId) {
                    const updatedCandidate = { ...c, notes: [note, ...c.notes] };
                    if (entry.type === TalentPipelineType.RE_ENGAGE) {
                        updatedCandidate.status = CandidateStatus.SCREENING;
                    }
                    return updatedCandidate;

                }
                return c;
            })
        };
    }
    case 'ADD_NOTE':
      return {
          ...state,
          candidates: state.candidates.map(c => 
              c.id === action.payload.candidateId ? {...c, notes: [action.payload.note, ...c.notes]} : c
          ),
          selectedCandidate: state.selectedCandidate?.id === action.payload.candidateId 
          ? {...state.selectedCandidate, notes: [action.payload.note, ...state.selectedCandidate.notes] } 
          : state.selectedCandidate
      };
    case 'ADD_CANDIDATE': {
        const newCandidate = action.payload;
        const phoneScreenTask = createAutomatedTask(
            newCandidate.id,
            `Phone screen ${newCandidate.name}`,
            1 // Due the next day
        );
        
        // Generate notification
        const newNotification: Notification = {
            id: `notif-new-${Date.now()}`,
            message: `New Candidate: ${newCandidate.name} added.`,
            candidateId: newCandidate.id,
            createdAt: new Date(),
            read: false,
            actionLink: 'candidate-detail'
        };
        
        return {
            ...state,
            candidates: [newCandidate, ...state.candidates],
            tasks: [phoneScreenTask, ...state.tasks],
            notifications: [newNotification, ...state.notifications],
        };
    }
    case 'ADD_CANDIDATES': {
        // Bulk add notifications
        const bulkNotification: Notification = {
            id: `notif-bulk-${Date.now()}`,
            message: `${action.payload.length} new candidates imported via CSV.`,
            createdAt: new Date(),
            read: false,
            actionLink: 'candidates'
        };

        return {
            ...state,
            candidates: [...action.payload, ...state.candidates],
            notifications: [bulkNotification, ...state.notifications],
        };
    }
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };
    case 'MARK_ALL_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
      };
    case 'RESTORE_STATE':
        return {
            ...state,
            candidates: action.payload.candidates,
            events: action.payload.events,
            tasks: action.payload.tasks,
            selectedCandidate: null,
            notifications: [], // Clear notifications after restore
        };
    case 'UPDATE_CANDIDATE_AVATAR':
        return {
            ...state,
            candidates: state.candidates.map(c =>
                c.id === action.payload.candidateId ? { ...c, avatarUrl: action.payload.avatarUrl } : c
            ),
            selectedCandidate: state.selectedCandidate?.id === action.payload.candidateId
                ? { ...state.selectedCandidate, avatarUrl: action.payload.avatarUrl }
                : state.selectedCandidate,
        };
    case 'UPDATE_TASK_STATUS': {
        const taskToUpdate = state.tasks.find(t => t.id === action.payload.taskId);
        if (!taskToUpdate || taskToUpdate.status === action.payload.status) return state;

        const newHistoryEntry = {
            timestamp: new Date().toISOString(),
            user: 'Admin',
            fromStatus: taskToUpdate.status,
            toStatus: action.payload.status,
        };
        
        let newNotifications = [...state.notifications];
        // Notify if task is Done
        if (action.payload.status === TaskStatus.DONE) {
             const candidate = state.candidates.find(c => c.id === taskToUpdate.candidateId);
             const candidateName = candidate ? candidate.name : 'Unknown';
             newNotifications.unshift({
                id: `notif-task-done-${Date.now()}`,
                message: `Task Completed: ${taskToUpdate.title} for ${candidateName}`,
                candidateId: taskToUpdate.candidateId,
                createdAt: new Date(),
                read: false,
                actionLink: 'tasks'
            });
        }

        return {
            ...state,
            notifications: newNotifications,
            tasks: state.tasks.map(t =>
                t.id === action.payload.taskId 
                ? { ...t, status: action.payload.status, history: [...t.history, newHistoryEntry] } 
                : t
            ),
        };
    }
    case 'BULK_UPDATE_CANDIDATE_STATUS': {
        const { candidateIds, status } = action.payload;
        let newTasks = [...state.tasks];
        const updatedIds = new Set(candidateIds);
        
        state.candidates.forEach(c => {
            if (updatedIds.has(c.id) && c.status !== status) {
                 switch(status) {
                    case CandidateStatus.SCREENING:
                        newTasks.push(createAutomatedTask(c.id, `Complete screening call for ${c.name}`, 1));
                        break;
                    case CandidateStatus.VIDEO_INTERVIEW:
                        newTasks.push(createAutomatedTask(c.id, `Schedule video interview for ${c.name}`, 2));
                        break;
                    case CandidateStatus.INDUCTION:
                        newTasks.push(createAutomatedTask(c.id, `Confirm induction details for ${c.name}`, 3));
                        break;
                    case CandidateStatus.HIRED:
                        newTasks.push(createAutomatedTask(c.id, `Finalise onboarding for ${c.name}`, 1));
                        if (c.referralSource?.type === ReferralSourceType.TPJ) {
                            newTasks.push(createAutomatedTask(c.id, `Pay TPJ Final Fee for ${c.name}`, 14));
                        }
                        break;
                }
            }
        });
        
        const updatedCandidates = state.candidates.map(c => {
            if (updatedIds.has(c.id)) {
                const updatedCandidate = { ...c, status: status };
                if (status === CandidateStatus.HIRED && !c.hiredAt) {
                    updatedCandidate.hiredAt = new Date().toISOString();
                } else if (status !== CandidateStatus.HIRED) {
                    delete updatedCandidate.hiredAt;
                }
                return updatedCandidate;
            }
            return c;
        });

        // Bulk Notification
        const newNotification: Notification = {
            id: `notif-bulk-status-${Date.now()}`,
            message: `Updated status to ${status} for ${candidateIds.length} candidates.`,
            createdAt: new Date(),
            read: false,
            actionLink: 'candidates'
        };

        return {
            ...state,
            tasks: newTasks,
            notifications: [newNotification, ...state.notifications],
            candidates: updatedCandidates,
             selectedCandidate: state.selectedCandidate && updatedIds.has(state.selectedCandidate.id)
                ? updatedCandidates.find(c => c.id === state.selectedCandidate!.id) || null
                : state.selectedCandidate,
        };
    }
    case 'ARCHIVE_COMPLETED_TASKS': {
      const historyEntry = {
          timestamp: new Date().toISOString(),
          user: 'Admin',
          fromStatus: TaskStatus.DONE,
          toStatus: TaskStatus.ARCHIVED,
      };

      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.status === TaskStatus.DONE
            ? {
                ...task,
                status: TaskStatus.ARCHIVED,
                archivedAt: new Date().toISOString(),
                archivedBy: 'Admin',
                history: [...task.history, historyEntry]
              }
            : task
        ),
      };
    }
    case 'RESTORE_TASK': {
        const { taskId } = action.payload;
        const taskToRestore = state.tasks.find(t => t.id === taskId);
        if (!taskToRestore) return state;

        const newHistoryEntry = {
            timestamp: new Date().toISOString(),
            user: 'Admin',
            fromStatus: TaskStatus.ARCHIVED,
            toStatus: TaskStatus.DONE,
        };

        return {
            ...state,
            tasks: state.tasks.map(task =>
                task.id === taskId
                ? {
                    ...task,
                    status: TaskStatus.DONE,
                    archivedAt: undefined,
                    archivedBy: undefined,
                    history: [...task.history, newHistoryEntry],
                  }
                : task
            ),
        };
    }
    case 'ADD_EVENT': {
        const event = action.payload;
        const candidate = state.candidates.find(c => c.id === event.candidateId);
        const name = candidate ? candidate.name : 'Unknown';
        
        const newNotification: Notification = {
            id: `notif-event-${Date.now()}`,
            message: `New Event: ${event.type} with ${name} on ${new Date(event.date).toLocaleDateString()}.`,
            candidateId: event.candidateId,
            createdAt: new Date(),
            read: false,
            actionLink: 'diary'
        };

        return {
            ...state,
            events: [...state.events, action.payload].sort((a,b) => a.date.getTime() - b.date.getTime()),
            notifications: [newNotification, ...state.notifications],
        };
    }
    case 'UPDATE_EVENT':
        return {
            ...state,
            events: state.events.map(e => e.id === action.payload.id ? action.payload : e).sort((a,b) => a.date.getTime() - b.date.getTime()),
        };
    case 'DELETE_EVENT':
        return {
            ...state,
            events: state.events.filter(e => e.id !== action.payload),
        };
    case 'ADD_TASK': {
        const task = action.payload;
        
        // Generate notification for new manual task
        const newNotification: Notification = {
            id: `notif-task-${Date.now()}`,
            message: `New Task Assigned: ${task.title}`,
            candidateId: task.candidateId,
            createdAt: new Date(),
            read: false,
            actionLink: 'tasks'
        };

        return {
            ...state,
            tasks: [action.payload, ...state.tasks],
            notifications: [newNotification, ...state.notifications],
        };
    }
    case 'ADD_TEMPLATE':
        return {
            ...state,
            templates: [...state.templates, action.payload],
        };
    case 'UPDATE_TEMPLATE':
        return {
            ...state,
            templates: state.templates.map(t => t.id === action.payload.id ? action.payload : t),
        };
    case 'DELETE_TEMPLATE':
        return {
            ...state,
            templates: state.templates.filter(t => t.id !== action.payload),
        };
    case 'MERGE_CANDIDATES': {
        const { masterCandidateId, duplicateCandidateIds } = action.payload;
        const allIdsToProcess = [masterCandidateId, ...duplicateCandidateIds];
        const candidatesToMerge = state.candidates.filter(c => allIdsToProcess.includes(c.id));
        
        if (candidatesToMerge.length < 2) return state;

        const masterCandidate = candidatesToMerge.find(c => c.id === masterCandidateId)!;
        const duplicates = candidatesToMerge.filter(c => c.id !== masterCandidateId);

        const allNotes = [...masterCandidate.notes, ...duplicates.flatMap(d => d.notes)]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const mergedCandidate = { ...masterCandidate, notes: allNotes };

        const remainingCandidates = state.candidates.filter(c => !allIdsToProcess.includes(c.id));
        
        // Notification
        const newNotification: Notification = {
            id: `notif-merge-${Date.now()}`,
            message: `Merged ${duplicates.length} duplicates into ${masterCandidate.name}.`,
            candidateId: masterCandidate.id,
            createdAt: new Date(),
            read: false,
            actionLink: 'candidate-detail'
        };
        
        return {
            ...state,
            candidates: [mergedCandidate, ...remainingCandidates],
            notifications: [newNotification, ...state.notifications],
            selectedCandidate: state.selectedCandidate && duplicateCandidateIds.includes(state.selectedCandidate.id) 
                ? mergedCandidate 
                : state.selectedCandidate
        };
    }
    case 'UPDATE_CANDIDATE_KIT': {
        const { candidateId, kit: desiredKitItems } = action.payload;

        const updateCandidate = (candidate: Candidate) => {
            const existingKit = candidate.assignedKit || [];
            const unmatchedExisting = [...existingKit];
            const finalKit: AssignedKitItem[] = [];

            desiredKitItems.forEach(desiredItem => {
                const matchIndex = unmatchedExisting.findIndex(
                    ex => ex.type === desiredItem.type && ex.size === desiredItem.size
                );

                if (matchIndex !== -1) {
                    const [matchedItem] = unmatchedExisting.splice(matchIndex, 1);
                    finalKit.push({
                        ...matchedItem,
                        ...desiredItem,
                        id: matchedItem.id,
                        assignedAt: matchedItem.assignedAt,
                        returnedAt: matchedItem.returnedAt
                    } as AssignedKitItem);
                } else {
                    finalKit.push({
                        id: `kit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        assignedAt: new Date().toISOString(),
                        ...desiredItem
                    } as AssignedKitItem);
                }
            });

            return { ...candidate, assignedKit: finalKit };
        };

        return {
            ...state,
            candidates: state.candidates.map(c => c.id === candidateId ? updateCandidate(c) : c),
            selectedCandidate: state.selectedCandidate?.id === candidateId ? updateCandidate(state.selectedCandidate) : state.selectedCandidate,
        };
    }
    case 'MARK_KIT_RETURNED': {
        const { candidateId, kitItemId } = action.payload;

        const updateCandidate = (candidate: Candidate) => {
            const updatedKit = (candidate.assignedKit || []).map(item =>
                item.id === kitItemId ? { ...item, returnedAt: new Date().toISOString() } : item
            );
            return { ...candidate, assignedKit: updatedKit };
        };

        return {
            ...state,
            candidates: state.candidates.map(c => c.id === candidateId ? updateCandidate(c) : c),
            selectedCandidate: state.selectedCandidate?.id === candidateId ? updateCandidate(state.selectedCandidate) : state.selectedCandidate,
        };
    }
     case 'BULK_ADD_NOTE': {
        const { candidateIds, note } = action.payload;
        const updatedIds = new Set(candidateIds);
        
        return {
          ...state,
          candidates: state.candidates.map(c => {
            if (updatedIds.has(c.id)) {
              const newNoteWithId: Note = {
                ...note,
                id: `n-${Date.now()}-${Math.random()}`,
              };
              return { ...c, notes: [newNoteWithId, ...c.notes] };
            }
            return c;
          }),
        };
      }
    case 'MARK_COST_PAID': {
        const { candidateId, costId } = action.payload;
        const updatedCandidates = state.candidates.map(c => {
            if (c.id === candidateId && c.providerCost) {
                const costItem = c.providerCost.find(cost => cost.id === costId);
                const updatedCosts = c.providerCost.map(cost => 
                    cost.id === costId ? { ...cost, status: PaymentStatus.PAID, paidAt: new Date().toISOString() } : cost
                );
                
                const note: Note = {
                    id: `n-${Date.now()}`,
                    content: `Provider Cost "${costItem?.type}" marked as PAID.`,
                    author: 'Admin',
                    date: new Date().toISOString(),
                };
                
                return { ...c, providerCost: updatedCosts, notes: [note, ...c.notes] };
            }
            return c;
        });
        
        return {
            ...state,
            candidates: updatedCandidates,
            selectedCandidate: state.selectedCandidate?.id === candidateId 
                ? updatedCandidates.find(c => c.id === candidateId) || null 
                : state.selectedCandidate,
        };
    }
    case 'UPDATE_COST_SETTINGS':
        return { ...state, costSettings: action.payload };
    case 'UPDATE_CANDIDATE_RATING': {
        const { candidateId: rateId, ratings } = action.payload;
        const ratedCandidates = state.candidates.map(c => 
            c.id === rateId ? { ...c, screeningRatings: ratings } : c
        );
        return {
            ...state,
            candidates: ratedCandidates,
            selectedCandidate: state.selectedCandidate?.id === rateId 
                ? { ...state.selectedCandidate, screeningRatings: ratings }
                : state.selectedCandidate
        };
    }
    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, undefined, loadState);

  // Auto-save logic
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Dark Mode Side Effect
  useEffect(() => {
      if (state.theme === 'dark') {
          document.documentElement.classList.add('dark');
      } else {
          document.documentElement.classList.remove('dark');
      }
  }, [state.theme]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
