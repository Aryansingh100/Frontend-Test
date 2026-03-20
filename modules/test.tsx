'use client'
import React, {useEffect, useState} from 'react';
import styles from './test.module.css';

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

export default function TaskManager():  {
    const [tasks, setTasks] = useState]>([]);
    const [inputTitle, setInputTitle] = useState("");
    const [priority, setPriority] = useState<Priority>("Medium");
    const [error, setError] = useState("");

    function addTask(){
        if (!inputTitle.trim()){
            setError("Title cannot be empty");
            return;
        }
    }
}