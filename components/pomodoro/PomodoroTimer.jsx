import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Timer, Play, Pause, Settings } from "lucide-react";
import cn from "classnames";

const DEFAULT_WORK_TIME = 25;
const DEFAULT_BREAK_TIME = 5;

export default function PomodoroTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_WORK_TIME * 60);
  const [showSettings, setShowSettings] = useState(false);
  const [showBreakDialog, setShowBreakDialog] = useState(false);
  const [workTime, setWorkTime] = useState(DEFAULT_WORK_TIME);
  const [breakTime, setBreakTime] = useState(DEFAULT_BREAK_TIME);

  const startTimer = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(workTime * 60);
    setIsBreak(false);
  }, [workTime]);

  const startBreak = useCallback(() => {
    setIsBreak(true);
    setTimeLeft(breakTime * 60);
    setShowBreakDialog(true);
    setIsRunning(true);
  }, [breakTime]);

  const continueStudying = useCallback(() => {
    setIsBreak(false);
    setTimeLeft(workTime * 60);
    setShowBreakDialog(false);
    setIsRunning(true);
  }, [workTime]);

  useEffect(() => {
    let interval;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (!isBreak) {
        startBreak();
      } else {
        continueStudying();
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, startBreak, continueStudying]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center gap-4">
        <div className={cn(
          "text-4xl font-bold font-mono",
          isBreak && "text-green-500",
          !isBreak && isRunning && "text-blue-500"
        )}>
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={isRunning ? pauseTimer : startTimer}
            className="rounded-full hover:bg-accent"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="rounded-full hover:bg-accent"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuración del Pomodoro</DialogTitle>
            <DialogDescription>
              Ajusta los tiempos de trabajo y descanso
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="col-span-2">Tiempo de trabajo (min)</label>
              <Select
                value={workTime.toString()}
                onValueChange={(value) => setWorkTime(Number(value))}
              >
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Selecciona tiempo" />
                </SelectTrigger>
                <SelectContent>
                  {[15, 20, 25, 30, 35, 40, 45, 50, 55, 60].map((time) => (
                    <SelectItem key={time} value={time.toString()}>
                      {time} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label className="col-span-2">Tiempo de descanso (min)</label>
              <Select
                value={breakTime.toString()}
                onValueChange={(value) => setBreakTime(Number(value))}
              >
                <SelectTrigger className="col-span-2">
                  <SelectValue placeholder="Selecciona tiempo" />
                </SelectTrigger>
                <SelectContent>
                  {[3, 5, 7, 10, 15].map((time) => (
                    <SelectItem key={time} value={time.toString()}>
                      {time} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => {
              setShowSettings(false);
              resetTimer();
            }}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBreakDialog} onOpenChange={setShowBreakDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Tiempo de descanso!</DialogTitle>
            <DialogDescription>
              Has completado tu sesión de trabajo. Toma un descanso.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex justify-center">
            <div className="text-4xl font-bold font-mono text-green-500">
              {formatTime(timeLeft)}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={continueStudying}>
              Continuar estudiando
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
