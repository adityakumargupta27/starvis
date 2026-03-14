
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
} from "recharts";
import SpaceBackground from "@/components/SpaceBackground";

const data = [
  { name: "Week 1", hours: 4 },
  { name: "Week 2", hours: 3 },
  { name: "Week 3", hours: 5 },
  { name: "Week 4", hours: 6 },
  { name: "Week 5", hours: 8 },
  { name: "Week 6", hours: 7 },
];

export default function StudyAnalytics() {
  return (
    <div className="relative flex-1 p-4 md:p-8 pt-6">
      <SpaceBackground />
      <div className="relative z-10">
        <Card className="bg-black/20 backdrop-blur-sm border-purple-400/20 text-white">
          <CardHeader>
            <CardTitle>Study Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.2)" />
                <XAxis dataKey="name" tick={{ fill: "white" }} />
                <YAxis tick={{ fill: "white" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.8)",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                />
                <Legend wrapperStyle={{ color: "white" }} />
                <Bar dataKey="hours" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
