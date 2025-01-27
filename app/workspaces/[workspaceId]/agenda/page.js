"use client";
import React, { useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, UserIcon, PlusIcon } from "lucide-react";

import TaskColumn from "@/components/agenda/TaskColumn";

export default function DraggableBoard() {
  const [columns, setColumns] = useState({
    "To Do": [],
    "In Progress": [],
    Done: [],
  });
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");

  const addTask = (status) => {
    if (newTaskTitle.trim() === "") return;
    const newTask = {
      id: Date.now(),
      title: newTaskTitle,
      description: "",
      status,
      dueDate: null,
      assignee: "",
      priority: "medium",
      subTasks: [],
    };

    setColumns((prevColumns) => ({
      ...prevColumns,
      [status]: [...prevColumns[status], newTask],
    }));
    setNewTaskTitle("");
  };

  const moveTask = (
    sourceColumn,
    sourceIndex,
    destinationColumn,
    destinationIndex
  ) => {
    const taskToMove = columns[sourceColumn][sourceIndex];
    const newSourceColumn = [...columns[sourceColumn]];
    const newDestinationColumn = [...columns[destinationColumn]];

    newSourceColumn.splice(sourceIndex, 1);
    newDestinationColumn.splice(destinationIndex, 0, taskToMove);

    setColumns((prevColumns) => ({
      ...prevColumns,
      [sourceColumn]: newSourceColumn,
      [destinationColumn]: newDestinationColumn,
    }));
  };

  const updateTask = (updatedTask) => {
    setColumns((prevColumns) => ({
      ...prevColumns,
      [updatedTask.status]: prevColumns[updatedTask.status].map((task) =>
        task.id === updatedTask.id ? updatedTask : task
      ),
    }));
    setEditingTask(null);
  };

  const addSubTask = () => {
    if (editingTask && newSubTaskTitle.trim() !== "") {
      const newSubTask = {
        id: Date.now(),
        title: newSubTaskTitle,
        completed: false,
      };
      setEditingTask({
        ...editingTask,
        subTasks: [...editingTask.subTasks, newSubTask],
      });
      setNewSubTaskTitle("");
    }
  };

  const toggleSubTask = (subTaskId) => {
    if (editingTask) {
      const updatedSubTasks = editingTask.subTasks.map((subTask) =>
        subTask.id === subTaskId
          ? { ...subTask, completed: !subTask.completed }
          : subTask
      );
      setEditingTask({ ...editingTask, subTasks: updatedSubTasks });
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Task Board</h1>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Object.keys(columns).map((columnId) => (
            <TaskColumn
              key={columnId}
              columnId={columnId}
              title={columnId}
              tasks={columns[columnId]}
              addTask={() => addTask(columnId)}
              setNewTaskTitle={setNewTaskTitle}
              newTaskTitle={newTaskTitle}
              moveTask={moveTask}
              setEditingTask={setEditingTask}
            />
          ))}
        </div>

        <Dialog
          open={editingTask !== null}
          onOpenChange={() => setEditingTask(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            {editingTask && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={editingTask.title}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, title: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={editingTask.description}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        description: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <select
                    id="status"
                    value={editingTask.status}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, status: e.target.value })
                    }
                    className="col-span-3"
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dueDate" className="text-right">
                    Due Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={`col-span-3 justify-start text-left font-normal ${
                          !editingTask.dueDate && "text-muted-foreground"
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingTask.dueDate ? (
                          format(editingTask.dueDate, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editingTask.dueDate}
                        onSelect={(date) =>
                          setEditingTask({ ...editingTask, dueDate: date })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assignee" className="text-right">
                    Assignee
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    <Input
                      id="assignee"
                      value={editingTask.assignee}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          assignee: e.target.value,
                        })
                      }
                      placeholder="Enter assignee name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="priority" className="text-right">
                    Priority
                  </Label>
                  <select
                    id="priority"
                    value={editingTask.priority}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        priority: e.target.value,
                      })
                    }
                    className="col-span-3"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right">Subtasks</Label>
                  <div className="col-span-3">
                    {editingTask.subTasks.map((subTask) => (
                      <div
                        key={subTask.id}
                        className="flex items-center gap-2 mb-2"
                      >
                        <Checkbox
                          id={`subtask-${subTask.id}`}
                          checked={subTask.completed}
                          onCheckedChange={() => toggleSubTask(subTask.id)}
                        />
                        <Label
                          htmlFor={`subtask-${subTask.id}`}
                          className={subTask.completed ? "line-through" : ""}
                        >
                          {subTask.title}
                        </Label>
                      </div>
                    ))}
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        placeholder="New subtask"
                        value={newSubTaskTitle}
                        onChange={(e) => setNewSubTaskTitle(e.target.value)}
                        className="flex-grow"
                      />
                      <Button onClick={addSubTask} size="sm">
                        <PlusIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <Button onClick={() => editingTask && updateTask(editingTask)}>
              Save Changes
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </DndProvider>
  );
}
