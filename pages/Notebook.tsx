
import React, { useState, useEffect, useRef } from 'react';
import { Folder, Note } from '../types';
import { getUserFolders, saveUserFolders } from '../services/authService';
import { useAppContext } from '../App';
import { 
  FolderPlus, FilePlus, Save, Trash2, Folder as FolderIcon, FileText, 
  Edit3, Image as ImageIcon, Bold, Italic, List, Heading, Type, Underline, Menu, Cloud, CloudOff, ArrowLeft
} from 'lucide-react';

export const Notebook: React.FC = () => {
    const { user } = useAppContext();
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    
    // Editor State
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
    
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Load
    useEffect(() => {
        const loadedFolders = getUserFolders();
        setFolders(loadedFolders);
        if (loadedFolders.length > 0) {
            setSelectedFolderId(loadedFolders[0].id);
        }
    }, [user]);

    // Autosave Persistence
    useEffect(() => {
        if (folders.length > 0) {
            setSaveStatus('saving');
            saveUserFolders(folders);
            const timer = setTimeout(() => setSaveStatus('saved'), 800);
            return () => clearTimeout(timer);
        }
    }, [folders]);

    // Sync Editor Content
    useEffect(() => {
        if (editMode && editorRef.current) {
            if (editorRef.current.innerHTML !== noteContent) {
                editorRef.current.innerHTML = noteContent;
            }
        }
    }, [editMode]);

    const createFolder = () => {
        const name = prompt("Enter folder name:");
        if (name) {
            const newFolder: Folder = {
                id: Date.now().toString(),
                name,
                notes: []
            };
            setFolders([...folders, newFolder]);
            setSelectedFolderId(newFolder.id);
        }
    };

    const deleteFolder = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Delete this folder and all notes inside?")) {
            setFolders(folders.filter(f => f.id !== id));
            if (selectedFolderId === id) setSelectedFolderId(null);
        }
    };

    const createNote = () => {
        if (!selectedFolderId) return;
        const newNote: Note = {
            id: Date.now().toString(),
            title: 'Untitled Note',
            content: '',
            images: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        
        const updatedFolders = folders.map(f => {
            if (f.id === selectedFolderId) {
                return { ...f, notes: [newNote, ...f.notes] };
            }
            return f;
        });
        setFolders(updatedFolders);
        setSelectedNote(newNote);
        setNoteTitle(newNote.title);
        setNoteContent(newNote.content);
        setEditMode(true);
        setShowMobileSidebar(false); 
    };

    const saveNote = () => {
        if (!selectedNote || !selectedFolderId) return;

        const updatedNote = {
            ...selectedNote,
            title: noteTitle,
            content: noteContent,
            updatedAt: Date.now()
        };

        const updatedFolders = folders.map(f => {
            if (f.id === selectedFolderId) {
                return {
                    ...f,
                    notes: f.notes.map(n => n.id === updatedNote.id ? updatedNote : n)
                };
            }
            return f;
        });
        
        setFolders(updatedFolders);
        setSelectedNote(updatedNote);
        setEditMode(false);
    };

    const deleteNote = (noteId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectedFolderId) return;
        if (confirm("Delete this note?")) {
             const updatedFolders = folders.map(f => {
                if (f.id === selectedFolderId) {
                    return { ...f, notes: f.notes.filter(n => n.id !== noteId) };
                }
                return f;
            });
            setFolders(updatedFolders);
            if (selectedNote?.id === noteId) {
                setSelectedNote(null);
                setEditMode(false);
            }
        }
    };

    const execCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            setNoteContent(editorRef.current.innerHTML);
            editorRef.current.focus();
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) {
                    document.execCommand('insertImage', false, ev.target.result as string);
                    if (editorRef.current) setNoteContent(editorRef.current.innerHTML);
                }
            };
            reader.readAsDataURL(file);
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const activeFolder = folders.find(f => f.id === selectedFolderId);

    return (
        <div className="h-[calc(100vh-140px)] flex gap-6 relative animate-in fade-in duration-500 font-sans">
            {/* Mobile Toggle */}
            <button 
                className="md:hidden absolute top-0 left-0 z-20 p-2 bg-indigo-600 text-white rounded-br-xl shadow-md"
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Sidebar: Folders */}
            <div className={`
                fixed inset-y-0 left-0 z-30 w-72 bg-white shadow-2xl transform transition-transform duration-300 md:relative md:translate-x-0 md:shadow-sm md:border md:border-slate-200 md:rounded-3xl md:flex md:flex-col
                ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 h-20 rounded-t-3xl">
                    <h3 className="font-extrabold text-slate-800 text-lg pl-10 md:pl-0 tracking-tight">Notebooks</h3>
                    <button onClick={createFolder} className="p-2 bg-indigo-50 hover:bg-indigo-100 rounded-lg text-indigo-600 transition-colors shadow-sm" title="New Folder">
                        <FolderPlus className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {folders.map(folder => (
                        <div 
                            key={folder.id}
                            onClick={() => { setSelectedFolderId(folder.id); setSelectedNote(null); setShowMobileSidebar(false); }}
                            className={`p-4 rounded-xl cursor-pointer flex justify-between items-center group transition-all duration-200 ${
                                selectedFolderId === folder.id 
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.02]' 
                                : 'hover:bg-slate-50 text-slate-600'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <FolderIcon className={`w-5 h-5 ${selectedFolderId === folder.id ? 'fill-indigo-400 text-indigo-200' : 'text-slate-400'}`} />
                                <span className="font-bold truncate text-sm">{folder.name}</span>
                            </div>
                            <span className={`text-xs opacity-60 font-medium ${selectedFolderId === folder.id ? 'text-indigo-200' : 'text-slate-400'}`}>{folder.notes.length}</span>
                            
                            <button onClick={(e) => deleteFolder(folder.id, e)} className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all ${selectedFolderId === folder.id ? 'hover:bg-indigo-500 text-indigo-100' : 'hover:bg-red-50 hover:text-red-500'}`}>
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Note List */}
            <div className={`w-full md:w-80 bg-white rounded-3xl shadow-sm border border-slate-200 flex flex-col overflow-hidden ${selectedNote ? 'hidden md:flex' : 'flex'}`}>
                 <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 h-20">
                    <div>
                        <h3 className="font-bold text-slate-800 truncate max-w-[150px]">{activeFolder?.name || 'Select Folder'}</h3>
                        <p className="text-xs text-slate-400 font-medium">{activeFolder?.notes.length || 0} notes</p>
                    </div>
                    <button onClick={createNote} disabled={!selectedFolderId} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors disabled:opacity-50">
                        <FilePlus className="w-4 h-4" /> New
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/30">
                    {activeFolder?.notes.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400">
                            <FileText className="w-10 h-10 mb-2 opacity-20" />
                            <p className="text-sm">No notes here yet.</p>
                        </div>
                    )}
                    {activeFolder?.notes.map(note => (
                        <div 
                            key={note.id}
                            onClick={() => { 
                                setSelectedNote(note); 
                                setNoteTitle(note.title); 
                                setNoteContent(note.content);
                                setEditMode(false);
                            }}
                            className={`p-4 rounded-2xl cursor-pointer border transition-all duration-200 ${
                                selectedNote?.id === note.id 
                                ? 'bg-white border-indigo-500 shadow-md ring-1 ring-indigo-500 z-10' 
                                : 'bg-white border-transparent hover:border-indigo-200 shadow-sm'
                            }`}
                        >
                            <h4 className={`font-bold text-sm line-clamp-1 mb-1 ${selectedNote?.id === note.id ? 'text-indigo-700' : 'text-slate-800'}`}>{note.title}</h4>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{note.content.replace(/<[^>]*>?/gm, '') || 'Empty note...'}</p>
                            <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-[10px] text-slate-400 font-medium">{new Date(note.updatedAt).toLocaleDateString()}</span>
                                <button onClick={(e) => deleteNote(note.id, e)} className="text-slate-300 hover:text-red-500 p-1 hover:bg-red-50 rounded">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div className={`${!selectedNote ? 'hidden md:flex' : 'flex'} flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 flex-col overflow-hidden relative transition-all`}>
                {selectedNote ? (
                    <>
                        <div className="p-4 border-b border-slate-100 flex flex-col gap-4 bg-white z-10">
                            <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-3 flex-1">
                                    <button onClick={() => setSelectedNote(null)} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-full">
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    {editMode ? (
                                        <input 
                                            type="text" 
                                            value={noteTitle} 
                                            dir="auto" 
                                            onChange={(e) => setNoteTitle(e.target.value)} 
                                            className="font-extrabold text-2xl text-slate-800 focus:outline-none w-full bg-transparent placeholder-slate-300 text-left"
                                            placeholder="Untitled Note"
                                        />
                                    ) : (
                                        <h2 className="font-extrabold text-2xl text-slate-900 truncate">{selectedNote.title}</h2>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <div className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                                        {saveStatus === 'saved' ? <Cloud className="w-3 h-3 text-emerald-500" /> : <CloudOff className="w-3 h-3 animate-pulse text-amber-500" />}
                                        {saveStatus === 'saved' ? 'Saved' : 'Saving...'}
                                    </div>

                                    {editMode ? (
                                        <button onClick={saveNote} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 text-sm font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95">
                                            <Save className="w-4 h-4" /> Save
                                        </button>
                                    ) : (
                                        <button onClick={() => setEditMode(true)} className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 text-sm font-bold transition-all">
                                            <Edit3 className="w-4 h-4" /> Edit
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Rich Text Toolbar */}
                            {editMode && (
                                <div className="flex flex-wrap items-center gap-1 p-1.5 bg-slate-50 rounded-xl border border-slate-200 w-full animate-in slide-in-from-top-2">
                                    <ToolbarButton onClick={() => execCommand('bold')} icon={<Bold className="w-4 h-4" />} title="Bold" />
                                    <ToolbarButton onClick={() => execCommand('italic')} icon={<Italic className="w-4 h-4" />} title="Italic" />
                                    <ToolbarButton onClick={() => execCommand('underline')} icon={<Underline className="w-4 h-4" />} title="Underline" />
                                    <div className="w-px h-5 bg-slate-300 mx-2" />
                                    <ToolbarButton onClick={() => execCommand('formatBlock', 'H1')} icon={<Heading className="w-4 h-4" />} title="Heading 1" />
                                    <ToolbarButton onClick={() => execCommand('formatBlock', 'H2')} icon={<Type className="w-4 h-4" />} title="Heading 2" />
                                    <div className="w-px h-5 bg-slate-300 mx-2" />
                                    <ToolbarButton onClick={() => execCommand('insertUnorderedList')} icon={<List className="w-4 h-4" />} title="Bullet List" />
                                    <div className="w-px h-5 bg-slate-300 mx-2" />
                                    <ToolbarButton onClick={() => fileInputRef.current?.click()} icon={<ImageIcon className="w-4 h-4" />} title="Insert Image" />
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-slate-50/20">
                            {editMode ? (
                                <div 
                                    ref={editorRef}
                                    contentEditable
                                    dir="auto"
                                    onInput={() => {
                                        if (editorRef.current) setNoteContent(editorRef.current.innerHTML);
                                    }}
                                    className="w-full h-full focus:outline-none prose prose-lg prose-indigo max-w-none text-slate-700 leading-relaxed min-h-[500px] outline-none empty:before:content-['Start_typing...'] empty:before:text-slate-300 text-left"
                                />
                            ) : (
                                <div 
                                    className="prose prose-lg prose-indigo max-w-none text-slate-700 leading-relaxed break-words text-left"
                                    dir="auto"
                                    dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                                />
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 bg-slate-50/30">
                        <div className="bg-slate-100 p-8 rounded-full mb-6">
                            <Edit3 className="w-12 h-12 text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Create or Select a Note</h3>
                        <p className="max-w-xs text-center text-slate-400">Capture your ideas, study notes, and research in one place.</p>
                    </div>
                )}
            </div>
            
            {/* Backdrop for Mobile Sidebar */}
            {showMobileSidebar && (
                <div 
                    className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}
        </div>
    );
};

const ToolbarButton: React.FC<{ onClick: () => void; icon: React.ReactNode; title: string }> = ({ onClick, icon, title }) => (
    <button 
        onClick={onClick} 
        className="p-2.5 text-slate-600 hover:text-indigo-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
        title={title}
    >
        {icon}
    </button>
);
