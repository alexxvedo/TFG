import { useDrag, useDrop } from "react-dnd";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

const ItemType = { TASK: "task" };

// TaskItem Component
export default function TaskItem({
  task,
  columnId,
  index,
  moveTask,
  setEditingTask,
}) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType.TASK,
    item: { id: task.id, sourceColumn: columnId, sourceIndex: index },
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, drop] = useDrop({
    accept: ItemType.TASK,
    hover: (draggedItem) => {
      if (draggedItem.id !== task.id && draggedItem.sourceColumn === columnId) {
        moveTask(columnId, draggedItem.sourceIndex, columnId, index);
        draggedItem.sourceIndex = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`cursor-move ${isDragging ? "opacity-50" : ""}`}
      onClick={() => setEditingTask(task)}
    >
      <Card>
        <CardContent>
          <div className="font-semibold">{task.title}</div>
          {task.dueDate && (
            <div className="text-sm text-gray-500">
              Due: {format(task.dueDate, "PP")}
            </div>
          )}
          {task.assignee && (
            <div className="text-sm text-gray-500">
              Assignee: {task.assignee}
            </div>
          )}
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              task.priority === "high"
                ? "bg-red-200 text-red-800"
                : task.priority === "medium"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-green-200 text-green-800"
            }`}
          >
            {task.priority}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
