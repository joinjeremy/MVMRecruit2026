
import React, { useRef, useEffect } from 'react';
import { BoldIcon, ItalicIcon, UnderlineIcon, ListBulletIcon, ListNumberIcon } from './icons';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
             if (document.activeElement !== editorRef.current) {
                 editorRef.current.innerHTML = value;
             }
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCmd = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        handleInput();
        editorRef.current?.focus();
    };

    return (
        <div className={`flex flex-col border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 overflow-hidden ${className}`}>
            <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800">
                <ToolbarButton onClick={() => execCmd('bold')} icon={<BoldIcon />} label="Bold" />
                <ToolbarButton onClick={() => execCmd('italic')} icon={<ItalicIcon />} label="Italic" />
                <ToolbarButton onClick={() => execCmd('underline')} icon={<UnderlineIcon />} label="Underline" />
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1" />
                <ToolbarButton onClick={() => execCmd('insertUnorderedList')} icon={<ListBulletIcon />} label="Bullet List" />
                <ToolbarButton onClick={() => execCmd('insertOrderedList')} icon={<ListNumberIcon />} label="Numbered List" />
            </div>
            <div
                ref={editorRef}
                contentEditable
                className="flex-1 p-3 focus:outline-none overflow-y-auto dark:text-white"
                onInput={handleInput}
                style={{ minHeight: '200px' }}
                suppressContentEditableWarning={true}
            />
        </div>
    );
};

const ToolbarButton = ({ onClick, icon, label }: any) => (
    <button
        type="button"
        onClick={onClick}
        className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
        title={label}
    >
        {React.cloneElement(icon, { className: "w-4 h-4" })}
    </button>
);

export default RichTextEditor;
