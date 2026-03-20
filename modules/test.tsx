'use client'
import React, {useEffect, useState} from 'react';
import styles from './test.module.css';
import { finished } from 'stream';

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
        if (filter === "Completed") return !t.finished;
        return true;
    })

    //Completed tasks are visually distinct and appear below active tasks
    const activeTasks = visibleTasks.filter(t => !t.finished);
    const completedTasks = visibleTasks.filter(t => t.finished);
    const sortedTasks = [...activeTasks, ...completedTasks];

    <div className={styles.container}>
        <h1 className={styles.title}>Task Management Component</h1>
        
    </div>
}