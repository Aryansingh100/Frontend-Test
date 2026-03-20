'use client'
import React, {useEffect, useState} from 'react';
import styles from './test.module.css';
import { finished } from 'stream';
import { json } from 'stream/consumers';

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

export default function TaskManager() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filter, setFilter] = useState<Filter>("All");
    const [inputTitle, setInputTitle] = useState("");
    const [priority, setPriority] = useState<Priority>("Medium");
    const [error, setError] = useState("");

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
    }, [tasks]);

    // Persist to local storage
    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    //Pressing enter in the input title should also add a task
    function handlekeyDown(e : React.KeyboardEvent<HTMLInputElement>){
        if (e.key == "Enter") addTask();
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

    //Completed tasks are visually distinct and appear below active tasks
    const activeTasks = visibleTasks.filter(t => !t.finished);
    const completedTasks = visibleTasks.filter(t => t.finished);
    const sortedTasks = [...activeTasks, ...completedTasks];

    return(
        <div className={styles.container}>
            <h1 className={styles.title}>Task Management Component</h1>
            <div className={styles.form}>
                <div className={styles.row}>
                    <label htmlFor='task-title' style={{display: "none"}}>
                        Task title
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

                {/* Validation error*/}
                {error && (
                <p id="title-error" className={styles.errorMsg} role="alert">
                    {error}
                </p>
                )}
            </div>

            {/*Filtering*/}
            <div className={styles.filter} role="group" aria-label="Filter tasks">
                {(["All", "Active", "Completed"] as Filter[]).map(f => (
                    <button
                    key = {f}
                    className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ""}`}
                    onClick={() => setFilter(f)}
                    aria-pressed={filter === f}
                >
                    {f}
                    </button>
                ))}
            </div>

            {/*List of tasks*/}
            {sortedTasks.length === 0 ? (
                <p className={styles.emptyMsg}>No tasks to show</p> ) : 
                (
                    <ul className={styles.taskList}>
                        {sortedTasks.map(task => (
                            <li
                            key={task.id}
                            className={`${styles.taskItem} ${task.finished ? styles.taskCompleted : ""}`}
                            >
                                <input type="checkbox"
                                className={styles.checkbox}
                                checked={task.finished}
                                onChange={() => toggleComplete(task.id)}
                                aria-label={`Mark "${task.title}" as ${task.finished ? "active" : "complete"}`}
                                />
                                
                                <div className={styles.taskInfo}>
                                    <span className={`${styles.taskTitle} ? {task.finished ? styles.taskTitleDone : ""}`}>
                                        {task.title} :   
                                    </span>
                                    <span className={`${styles.taskPriority} ? {priorityClass(task.priority)}`}>
                                        {task.priority}
                                    </span>
                                </div>
                                <div className={styles.actions}>
                                    <button
                                    className={styles.deleteBtn}
                                    onClick={() => deleteTask(task.id)}
                                    aria-label={`Delete "${task.title}"`}>
                                    Delete
                                    </button>
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