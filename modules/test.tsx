'use client'
import React, {useEffect, useState} from 'react';
import styles from './test.module.css';
import { finished } from 'stream';
import { json } from 'stream/consumers';
import { title } from 'process';

// Your Test Starts Here

// Priority control
type Priority = "Low" | "Medium" | "High";

// Filter control
type Filter = "All" | "Active" | "Completed";

interface Task {
    id : string;
    title : string;
    priority : Priority;
    finished : boolean;
}

export default function TaskManager() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filter, setFilter] = useState<Filter>("All");
    const [inputTitle, setInputTitle] = useState("");
    const [priority, setPriority] = useState<Priority>("Medium");
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");

    // Adding edit Functions
    const [editId, setEditId] = useState<String>("");
    const [editTitle, setEditTitle] = useState("");
    const [editPriority, setEditPriority] = useState<Priority>("Medium");

    // Function to map priority class to styles
    function priorityClass(p : Priority){
        if (p === "Low") return styles.priorityLow;
        if (p === "High") return styles.priorityHigh;
        return styles.priorityMedium;
    }

    // Function to load data from Local Storage
    function dataPersistance(): Task[] {
        try{
            const raw = localStorage.getItem("tasks");
            return raw ? (JSON.parse(raw) as Task[]) : [];
        } catch {
            return [];
        }
    }

    function addTask(){
        if (!inputTitle.trim()){
            setError("Title cannot be empty");
            return;
        }
        const newTask : Task = {
            id : crypto.randomUUID(),
            title : inputTitle.trim(),
            priority,
            finished : false
        };

        setTasks(prev => [newTask, ...prev]);
        setInputTitle("");
        setError("");
    }

    // Persistance functions
    useEffect(() => {
        setTasks(dataPersistance());
    }, []);

    // Persist to local storage
    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    //Pressing enter in the input title should also add a task
    function handlekeyDown(e : React.KeyboardEvent<HTMLInputElement>){
        if (e.key == "Enter") addTask();
    }

    // Edit task
    function editTask(task : Task){
        setEditId(task.id);
        setEditTitle(task.title);
        setEditPriority(task.priority);
    }

    function finishEdit(id : string){
        setTasks(prev => prev.map(t => t.id === id ? 
            {...t, title: editTitle, priority: editPriority} : t
            )
        );    
        setEditId("");
    }

    // Completed tasks
    function toggleComplete(id : string){
        setTasks(prev => 
            prev.map(t => t.id == id ? {...t, finished: !t.finished } : t)
        );
    }

    // Deleting a task
    function deleteTask(id : string){
        setTasks(prev => prev.filter(t => t.id !== id));
    }

    //Filter by status
    const visibleTasks = tasks.filter(t => {
        if (filter === "Active") return !t.finished;
        if (filter === "Completed") return t.finished;
        return true;
    })
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

    //Completed tasks are visually distinct and appear below active tasks
    const activeTasks = visibleTasks.filter(t => !t.finished);
    const completedTasks = visibleTasks.filter(t => t.finished);
    const sortedTasks = [...activeTasks, ...completedTasks];

    return(
        <div className={styles.container}>
            <h1 className={styles.title}>Task Management Component</h1>
            <div className={styles.form}>
                <div className={styles.row}>
                    <label htmlFor='task-title'>
                    </label>
                    {/* Task Form*/}
                    <input
                        id = "task-title"
                        type="text"
                        className={`${styles.input} ${error ? styles.inputError : ""}`}
                        placeholder="Task title..."
                        value={inputTitle}
                        onChange={e => {
                            setInputTitle(e.target.value);
                            if (error) setError("");
                        }}
                        onKeyDown={handlekeyDown}
                        aria-describedby={error ? "title-error" : undefined}
                    />

                    <div className={styles.secondRow}>
                        {/* Selecting priority*/}
                        <label htmlFor="task-priority" style={{ display: "none" }}>
                            Priority
                        </label>
                        <select
                            id="task-priority"
                            className={styles.select}
                            value={priority}
                            onChange={e => setPriority(e.target.value as Priority)}
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>

                        <button className={styles.addButton} onClick={addTask}>
                            Add Task
                        </button>
                    </div>
                </div> 

                {/* Searching*/}
                <label htmlFor="search">Search Tasks</label>
                <input
                id = "search"
                type="search"
                className={styles.inputSearch}
                placeholder="Enter task"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ marginBottom : 10}}
                />

                {/* Validation error*/}
                {error && (
                <p id="title-error" className={styles.errorMsg} role="alert">
                    {error}
                </p>
                )}
            </div>

            {/*Filtering*/}
            <div className={styles.filter} role="group" aria-label="Filter tasks">
                {(["All", "Active", "Completed"] as Filter[]).map(t => (
                    <button
                    key = {t}
                    className={`${styles.filterBtn} ${filter === t ? styles.filterActive : ""}`}
                    onClick={() => setFilter(t)}
                    aria-pressed={filter === t}
                >
                    {t}
                    </button>
                ))}
            </div>

            {/*List of tasks*/}
            {sortedTasks.length === 0 ? (
                <p className={styles.emptyMsg}>No tasks currently</p> ) : 
                (
                    <ul className={styles.taskList}>
                        {sortedTasks.map(task => (
                            <li
                            key={task.id}
                            className={`${styles.taskItem} ${task.finished ? styles.taskCompleted : ""}`}
                            >
                                <input type="checkbox"
                                className={styles.checkbox} 
                                onChange={() => toggleComplete(task.id)}
                                checked={task.finished}
                                />

                                {/*Editing*/}
                                {editId === task.id ? (
                                    <><input value={editTitle}
                                        className={styles.editInput}
                                        onChange={e => setEditTitle(e.target.value)} />\
                                        <select value={editPriority}
                                        className={styles.editPriority}
                                        onChange={e => setEditPriority(e.target.value as Priority)}>
                                            <option value="Low">Low</option>
                                            <option value="Medium">Medium</option>
                                            <option value="High">High</option>
                                        </select>
                                    </>
                                ) : (
                                    <div className={styles.taskInfo}>
                                    <span className={`${styles.taskTitle} ${task.finished ? styles.taskTitleDone : ""}`}>
                                        {task.title} :   
                                    </span>
                                    <span className={`${styles.taskPriority} ${priorityClass(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                </div>
                                )
                                
                                }
                                <div className={styles.actions}>
                                    {/*Delete button*/}
                                    <button
                                    className={styles.deleteBtn}
                                    onClick={() => deleteTask(task.id)}>
                                    Delete
                                    </button>

                                    {editId  === task.id ? (
                                        <button
                                            className={styles.saveBtn}
                                            aria-label="Save Task"
                                            onClick={() => finishEdit(task.id)}>
                                                Save
                                        </button>       
                                    ) : (
                                        <button
                                                className={styles.editBtn}
                                                aria-label="Edit Task"
                                                onClick={() => editTask(task)}>
                                                Edit
                                        </button>
                                    )}
                                </div>
                            </li>
                            ))
                        }
                    </ul>
                )
            }
        </div>
    );
}