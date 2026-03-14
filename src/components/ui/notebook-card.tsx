import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Notebook } from "@/lib/notebook-data";

interface NotebookCardProps {
  notebook: Notebook;
}

export function NotebookCard({ notebook }: NotebookCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{notebook.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{notebook.description}</p>
      </CardContent>
    </Card>
  );
}
