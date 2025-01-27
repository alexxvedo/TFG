import { useDrop } from "react-dnd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TaskItem from "./TaskItem";

const ItemType = { TASK: "task" };

// TaskColumn Component
export default function TaskColumn({
  columnId,
  title,
  tasks,
  addTask,
  newTaskTitle,
  setNewTaskTitle,
  moveTask,
  setEditingTask,
}) {
  const [, drop] = useDrop({
    accept: ItemType.TASK,
    drop: (draggedItem) => {
      if (draggedItem.sourceColumn !== columnId) {
        moveTask(
          draggedItem.sourceColumn,
          draggedItem.sourceIndex,
          columnId,
          tasks.length
        );
        draggedItem.sourceColumn = columnId;
        draggedItem.sourceIndex = tasks.length - 1;
      }
    },
  });

  return (
    <Card ref={drop} className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {tasks.map((task, index) => (
          <TaskItem
            key={task.id}
            task={task}
            columnId={columnId}
            index={index}
            moveTask={moveTask}
            setEditingTask={setEditingTask}
          />
        ))}
        <div className="flex items-center gap-2 mt-2">
          <Input
            placeholder="New task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-grow"
          />
          <Button onClick={addTask}>+ New Task</Button>
        </div>
      </CardContent>
    </Card>
  );
}
