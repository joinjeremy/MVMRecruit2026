
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Task, TaskStatus } from '../types';
import { ArchiveBoxIcon, ClockIcon, PlusIcon } from './icons';
import ArchivedTasksModal from './ArchivedTasksModal';
import TaskHistoryModal from './TaskHistoryModal';
import AddTaskModal from './AddTaskModal';

const TaskCard: React.FC<{ task: Task; onHistoryClick: () => void }> = ({ task, onHistoryClick }) => {
    const { state } = useAppContext();
    const candidate = state.candidates.find(c => c.id === task.candidateId);
    
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE;

    return (
        <div 
            draggable 
            onDragStart={(e) => {
                e.dataTransfer.setData('taskId', task.id);
            }}
            className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing"
        >
            <div className="flex justify-between items-start">
                <p className="font-medium text-brand-charcoal text-sm pr-2">{task.title}</p>
                <button 
                    onClick={(e) => { e.stopPropagation(); onHistoryClick(); }} 
                    className="p-1 text-slate-400 hover:text-brand-accent hover:bg-slate-100 rounded-full flex-shrink-0"
                    aria-label="View task history"
                >
                    <ClockIcon className="w-4 h-4" />
                </button>
            </div>
            {candidate && <p className="text-xs text-brand-gray-dark mt-1">For: {candidate.name}</p>}
            <div className={`text-xs font-semibold mt-2 ${isOverdue ? 'text-red-600' : 'text-brand-gray-dark'}`}>
                Due: {new Date(task.dueDate).toLocaleDateString('en-GB')}
            </div>
        </div>
    );
};

interface TaskColumnProps {
    status: TaskStatus;
    tasks: Task[];
    onDrop: (status: TaskStatus) => void;
    onClearCompleted?: () => void;
    onTaskHistoryClick: (task: Task) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks, onDrop, onClearCompleted, onTaskHistoryClick }) => {
    const [isOver, setIsOver] = React.useState(false);

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(true);
    };
    
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsOver(false);
        onDrop(status);
    };

    const getStatusColor = () => {
        switch (status) {
            case TaskStatus.TO_DO: return 'bg-yellow-500';
            case TaskStatus.IN_PROGRESS: return 'bg-blue-500';
            case TaskStatus.DONE: return 'bg-green-500';
            default: return 'bg-slate-400';
        }
    };

    return (
        <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-1 bg-slate-100 rounded-lg p-4 transition-colors ${isOver ? 'bg-slate-200' : ''}`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${getStatusColor()}`}></span>
                    <h3 className="font-semibold text-brand-charcoal">{status}</h3>
                    <span className="ml-2 text-sm font-medium bg-slate-200 text-slate-600 rounded-full px-2 py-0.5">{tasks.length}</span>
                </div>
                 {status === TaskStatus.DONE && tasks.length > 0 && onClearCompleted && (
                    <button 
                        onClick={onClearCompleted}
                        className="text-xs font-medium text-brand-accent hover:underline"
                    >
                        Clear Completed
                    </button>
                )}
            </div>
            <div className="space-y-3 h-[calc(100vh-18rem)] overflow-y-auto pr-2">
                {tasks.map(task => <TaskCard key={task.id} task={task} onHistoryClick={() => onTaskHistoryClick(task)} />)}
            </div>
        </div>
    );
};

const TaskBoardView: React.FC = () => {
    const { state, dispatch } = useAppContext();
    const { tasks } = state;
    const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    const [historyModalTask, setHistoryModalTask] = useState<Task | null>(null);

    const visibleTasks = tasks.filter(t => t.status !== TaskStatus.ARCHIVED);

    const tasksByStatus = {
        [TaskStatus.TO_DO]: visibleTasks.filter(t => t.status === TaskStatus.TO_DO),
        [TaskStatus.IN_PROGRESS]: visibleTasks.filter(t => t.status === TaskStatus.IN_PROGRESS),
        [TaskStatus.DONE]: visibleTasks.filter(t => t.status === TaskStatus.DONE),
    };
    
    const onColumnDrop = (newStatus: TaskStatus) => {
        const taskId = (window as any).draggedTaskId;
        if (taskId) {
            dispatch({ type: 'UPDATE_TASK_STATUS', payload: { taskId, status: newStatus } });
        }
    }
    
    React.useEffect(() => {
        const setDraggedTaskId = (e: DragEvent) => {
            (window as any).draggedTaskId = e.dataTransfer?.getData('taskId');
        };
        document.addEventListener('dragstart', setDraggedTaskId);
        return () => document.removeEventListener('dragstart', setDraggedTaskId);
    }, []);

    const handleArchiveTasks = () => {
        if (window.confirm("Are you sure you want to clear all completed tasks? They will be moved to the archive.")) {
            dispatch({ type: 'ARCHIVE_COMPLETED_TASKS' });
        }
    };


    return (
        <>
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-brand-charcoal">Task Board</h1>
                        <p className="text-brand-gray-dark mt-1">Manage your tasks with a drag-and-drop board.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setIsAddTaskModalOpen(true)}
                            className="flex items-center bg-brand-plum text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-colors shadow-sm"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            New Task
                        </button>
                        <button 
                            onClick={() => setIsArchiveModalOpen(true)}
                            className="flex items-center bg-white border border-slate-300 text-brand-gray-dark px-3 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                        >
                            <ArchiveBoxIcon className="w-5 h-5 mr-2" />
                            View Archive
                        </button>
                    </div>
                </div>
                <div className="flex-1 flex gap-6 mt-6">
                    <TaskColumn 
                        status={TaskStatus.TO_DO} 
                        tasks={tasksByStatus[TaskStatus.TO_DO]} 
                        onDrop={onColumnDrop}
                        onTaskHistoryClick={setHistoryModalTask}
                    />
                    <TaskColumn 
                        status={TaskStatus.IN_PROGRESS} 
                        tasks={tasksByStatus[TaskStatus.IN_PROGRESS]}
                        onDrop={onColumnDrop}
                        onTaskHistoryClick={setHistoryModalTask}
                    />
                    <TaskColumn 
                        status={TaskStatus.DONE} 
                        tasks={tasksByStatus[TaskStatus.DONE]}
                        onDrop={onColumnDrop}
                        onClearCompleted={handleArchiveTasks}
                        onTaskHistoryClick={setHistoryModalTask}
                    />
                </div>
            </div>
            {historyModalTask && (
                <TaskHistoryModal
                    isOpen={!!historyModalTask}
                    onClose={() => setHistoryModalTask(null)}
                    task={historyModalTask}
                />
            )}
            <ArchivedTasksModal
                isOpen={isArchiveModalOpen}
                onClose={() => setIsArchiveModalOpen(false)}
            />
            <AddTaskModal 
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
            />
        </>
    );
};

export default TaskBoardView;
