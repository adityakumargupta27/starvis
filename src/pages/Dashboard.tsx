
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { BookOpen, FileText, Clock, Calendar, Sigma, FlaskConical, Laptop } from "lucide-react";
import SpaceBackground from "@/components/SpaceBackground";

const summaryData = [
  {
    title: "Total Courses",
    value: "12",
    icon: <BookOpen className="h-8 w-8 text-purple-400" />,
  },
  {
    title: "Assignments Due",
    value: "5",
    icon: <FileText className="h-8 w-8 text-blue-400" />,
  },
  {
    title: "Avg. Study Time",
    value: "3.5h",
    icon: <Clock className="h-8 w-8 text-orange-400" />,
  },
  {
    title: "Upcoming Exams",
    value: "2",
    icon: <Calendar className="h-8 w-8 text-red-400" />,
  },
];

const studyData = [
    { name: "Mon", Study: 4, Procrastination: 1 },
    { name: "Tue", Study: 3, Procrastination: 2 },
    { name: "Wed", Study: 5, Procrastination: 1.5 },
    { name: "Thu", Study: 2, Procrastination: 3 },
    { name: "Fri", Study: 4.5, Procrastination: 1 },
    { name: "Sat", Study: 6, Procrastination: 0.5 },
];

const subjectPerformanceData = [
    { name: "Math", value: 85 }, 
    { name: "Science", value: 92 },
    { name: "History", value: 78 },
];
const SUBJECT_COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

const dailyStudyTrendData = [
    { name: 'Week 1', value: 20 },
    { name: 'Week 2', value: 25 },
    { name: 'Week 3', value: 22 },
    { name: 'Week 4', value: 28 },
    { name: 'Week 5', value: 30 },
    { name: 'Week 6', value: 35 },
];

const coursesData = [
    { name: 'Mathematics', progress: 75, icon: <Sigma className="h-5 w-5 mr-2" /> },
    { name: 'Web Development', progress: 50, icon: <Laptop className="h-5 w-5 mr-2" /> },
    { name: 'Chemistry', progress: 86, icon: <FlaskConical className="h-5 w-5 mr-2" /> },
];

const monthlyProgressData = [
    { name: 'Week 1', value: 180 },
    { name: 'Week 2', value: 160 },
    { name: 'Week 3', value: 200 },
    { name: 'Week 4', value: 232 },
]

export default function Dashboard() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <SpaceBackground />
        <div className="relative z-10">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summaryData.map((data, index) => (
                    <Card key={index} className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{data.title}</CardTitle>
                            {data.icon}
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
                <Card className="col-span-4 bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
                    <CardHeader>
                        <CardTitle>Study Hours vs. Procrastination</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={studyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'white' }} />
                                <YAxis tickLine={false} axisLine={false} tick={{ fill: 'white' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.3)' }} />
                                <Legend iconType="circle" wrapperStyle={{ color: 'white' }} />
                                <Bar dataKey="Study" stackId="a" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Procrastination" stackId="a" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="col-span-3 bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
                    <CardHeader>
                        <CardTitle>Subject-wise Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={subjectPerformanceData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5}>
                                    {subjectPerformanceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={SUBJECT_COLORS[index % SUBJECT_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.3)' }} />
                                <Legend iconType="circle" wrapperStyle={{ color: 'white' }}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mt-4">
                <Card className="md:col-span-2 bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
                    <CardHeader>
                        <CardTitle>Daily Study Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dailyStudyTrendData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fill: 'white' }} />
                                <YAxis tick={{ fill: 'white' }} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.3)' }} />
                                <Line type="monotone" dataKey="value" stroke="#ff7300" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                 <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>My Courses</CardTitle>
                          <Badge variant="secondary">In Progress</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {coursesData.map(item => (
                                 <div key={item.name} className="flex justify-between items-center">
                                    <div className="flex items-center">
                                      {item.icon}
                                      <span>{item.name}</span>
                                    </div>
                                    <span className="font-semibold">{item.progress}%</span>
                                 </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
             <div className="grid gap-4 md:grid-cols-1 mt-4">
                 <Card className="shadow-sm bg-purple-600/50 backdrop-blur-sm border-purple-400/20 text-white">
                    <CardHeader>
                        <CardTitle>85%</CardTitle>
                        <p>Monthly Progress</p>
                    </CardHeader>
                    <CardContent>
                         <ResponsiveContainer width="100%" height={100}>
                            <LineChart data={monthlyProgressData}>
                                <Tooltip contentStyle={{ backgroundColor: 'transparent', border: 'none' }} labelStyle={{ display: 'none' }} itemStyle={{ color: 'white' }}/>
                                <Line type="monotone" dataKey="value" stroke="white" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
