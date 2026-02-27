'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type TrendPoint = {
  date: string;
  trips: number;
  requests: number;
  confirmed: number;
};

type BreakdownPoint = {
  name: string;
  value: number;
};

type RoutePoint = {
  route: string;
  trips: number;
  confirmed: number;
};

type AdminAnalyticsChartsProps = {
  trendData: TrendPoint[];
  requestStatusData: BreakdownPoint[];
  tripTypeData: BreakdownPoint[];
  topRoutesData: RoutePoint[];
};

const PIE_COLORS = ['#1d4ed8', '#059669', '#d97706', '#dc2626', '#4f46e5', '#0891b2'];

export function AdminAnalyticsCharts({
  trendData,
  requestStatusData,
  tripTypeData,
  topRoutesData,
}: AdminAnalyticsChartsProps) {
  return (
    <div className="grid gap-3 xl:grid-cols-2">
      <Card className="auth-hero-card">
        <CardHeader>
          <CardTitle>Trips and Bookings Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" minTickGap={20} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="trips"
                  name="Trips"
                  stroke="#1d4ed8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="requests"
                  name="Bookings"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="confirmed"
                  name="Confirmed"
                  stroke="#d97706"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="auth-hero-card">
        <CardHeader>
          <CardTitle>Booking Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={requestStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {requestStatusData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="auth-hero-card">
        <CardHeader>
          <CardTitle>Trip Type Mix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tripTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {tripTypeData.map((entry, index) => (
                    <Cell key={entry.name} fill={PIE_COLORS[(index + 2) % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="auth-hero-card">
        <CardHeader>
          <CardTitle>Top Routes by Trips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRoutesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="route" hide />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="trips" name="Trips" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="confirmed" name="Confirmed" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
