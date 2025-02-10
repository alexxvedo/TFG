import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CalendarFlashcards from "./CalendarFlashcards";
import { useCollectionStore } from "@/store/collections-store/collection-store";
import { isToday } from "date-fns";

const COLORS = ["#ef4444", "#3b82f6", "#22c55e"];

export default function Stats({ flashcardsDataBD }) {
  const [activeTab, setActiveTab] = useState("general");

  if (!flashcardsDataBD?.estados) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex flex-col items-center">
            <h2 className="text-xl font-bold mb-4">
              Estadísticas de Flashcards
            </h2>
            <p className="text-muted-foreground">No hay datos disponibles</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-h-[80vh] overflow-y-auto">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="tiempo">Tiempo</TabsTrigger>
          <TabsTrigger value="rendimiento">Rendimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <EstadisticaSimple
              titulo="Total de Flashcards"
              valor={flashcardsDataBD.totalCreadas || 0}
            />
            <EstadisticaSimple
              titulo="Creadas (últimos 7 días)"
              valor={flashcardsDataBD.creadasUltimos7Dias || 0}
            />
            <EstadisticaSimple
              titulo="Estudiadas (últimos 7 días)"
              valor={flashcardsDataBD.revisadasUltimos7Dias || 0}
            />
            <EstadisticaSimple
              titulo="Progreso General"
              valor={`${Math.round(flashcardsDataBD.porcentajeCompletadas || 0)}%`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Estado de las Flashcards</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={flashcardsDataBD.estadosPorStatus?.map(estado => ({
                        name: estado.status,
                        value: estado.count
                      })) || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {[0, 1, 2].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nivel de Conocimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={flashcardsDataBD.estadosPorConocimiento?.map(estado => ({
                        name: estado.knowledgeLevel,
                        value: estado.count
                      })) || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {[0, 1, 2].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EstadisticaSimple
              titulo="Racha Actual"
              valor={`${flashcardsDataBD.rachaActual || 0} días`}
            />
            <EstadisticaSimple
              titulo="Racha más Larga"
              valor={`${flashcardsDataBD.rachaMasLarga || 0} días`}
            />
            <EstadisticaSimple
              titulo="Tasa de Éxito"
              valor={`${Math.round((flashcardsDataBD.porcentajeExito || 0) * 100)}%`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <CalendarFlashcards />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tiempo" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EstadisticaSimple
              titulo="Tiempo Total de Estudio"
              valor={`${flashcardsDataBD.tiempoTotalDeEstudio} min`}
            />
            <EstadisticaSimple
              titulo="Promedio por Sesión"
              valor={`${flashcardsDataBD.tiempoPromedioPorSesion} min`}
            />
            <EstadisticaSimple
              titulo="Promedio por Flashcard"
              valor={`${flashcardsDataBD.tiempoPromedioPorFlashcard} min`}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribución Horaria del Estudio</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={flashcardsDataBD.distribucionHoraria}>
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Bar dataKey="cantidad" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Flashcards con Mayor Tiempo de Respuesta</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pregunta</TableHead>
                    <TableHead>Tiempo (min)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flashcardsDataBD.flashcardsMayorTiempo?.map((flashcard) => (
                    <TableRow key={flashcard.id}>
                      <TableCell>{flashcard.pregunta}</TableCell>
                      <TableCell>{flashcard.tiempo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rendimiento" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EstadisticaSimple
              titulo="Tasa de Éxito"
              valor={`${Math.round(flashcardsDataBD.porcentajeExito * 100)}%`}
            />
            <EstadisticaSimple
              titulo="Promedio de Intentos por Correcta"
              valor={flashcardsDataBD.promedioIntentosPorCorrecta?.toFixed(1)}
            />
            <EstadisticaSimple
              titulo="Flashcards para Revisar"
              valor={flashcardsDataBD.flashcardsParaRevisar}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Flashcards Más Difíciles</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pregunta</TableHead>
                      <TableHead>Intentos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flashcardsDataBD.flashcardsDificiles?.map((flashcard) => (
                      <TableRow key={flashcard.id}>
                        <TableCell>{flashcard.pregunta}</TableCell>
                        <TableCell>{flashcard.intentos}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Flashcards Más Revisitadas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pregunta</TableHead>
                      <TableHead>Revisiones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flashcardsDataBD.flashcardsRevisitadas?.map(
                      (flashcard) => (
                        <TableRow key={flashcard.id}>
                          <TableCell>{flashcard.pregunta}</TableCell>
                          <TableCell>{flashcard.revisiones}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EstadisticaSimple({ titulo, valor }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-center">{valor}</p>
      </CardContent>
    </Card>
  );
}
