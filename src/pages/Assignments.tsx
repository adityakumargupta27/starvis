
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import SpaceBackground from "@/components/SpaceBackground";

const assignments = [
  {
    course: "Mathematics",
    assignment: "Problem Set 1",
    dueDate: "2024-10-26",
    status: "Completed",
  },
  {
    course: "History",
    assignment: "Essay",
    dueDate: "2024-11-15",
    status: "In Progress",
  },
  {
    course: "Web Development",
    assignment: "Project Milestone 2",
    dueDate: "2024-11-20",
    status: "In Progress",
  },
  {
    course: "Chemistry",
    assignment: "Lab Report 3",
    dueDate: "2024-11-22",
    status: "Not Started",
  },
  {
    course: "Physics",
    assignment: "Chapter 5 Homework",
    dueDate: "2024-11-25",
    status: "Not Started",
  },
];

export default function Assignments() {
  return (
    <div className="relative flex-1 p-4 md:p-8 pt-6">
      <SpaceBackground />
      <div className="relative z-10">
        <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
          <CardHeader>
            <CardTitle>Assignment Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-purple-400/30">
                  <TableHead className="text-white">Course</TableHead>
                  <TableHead className="text-white">Assignment</TableHead>
                  <TableHead className="text-white">Due Date</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((item, index) => (
                  <TableRow key={index} className="border-b border-purple-400/20">
                    <TableCell>{item.course}</TableCell>
                    <TableCell>{item.assignment}</TableCell>
                    <TableCell>{item.dueDate}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
