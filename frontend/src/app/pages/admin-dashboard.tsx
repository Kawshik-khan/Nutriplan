import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { 
  Shield, 
  Users, 
  Database, 
  AlertCircle, 
  Search,
  Plus,
  Edit,
  Trash2,
  BarChart3
} from "lucide-react";

const foodDatabase = [
  { id: 1, name: "Grilled Chicken Breast", calories: 165, protein: 31, status: "approved" },
  { id: 2, name: "Brown Rice", calories: 112, protein: 2.6, status: "approved" },
  { id: 3, name: "Broccoli", calories: 55, protein: 3.7, status: "approved" },
  { id: 4, name: "Salmon Fillet", calories: 206, protein: 22, status: "pending" },
  { id: 5, name: "Sweet Potato", calories: 86, protein: 1.6, status: "approved" },
];

const users = [
  { id: 1, name: "John Doe", email: "john@example.com", plan: "Premium", status: "active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", plan: "Free", status: "active" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", plan: "Premium", status: "inactive" },
];

const flaggedContent = [
  { id: 1, type: "Food", name: "Custom Protein Bar", reason: "Incomplete nutrition data", user: "Sarah K." },
  { id: 2, type: "Recipe", name: "Vegan Smoothie", reason: "Allergen warning missing", user: "Tom B." },
];

export default function AdminDashboard() {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#DC2626] rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-[#111827]">Admin Dashboard</h1>
            <p className="text-[#6B7280]">Manage content, users, and system data</p>
          </div>
        </div>

        <Badge className="bg-[#DC2626] text-white text-sm px-4 py-2">
          Admin Access
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white rounded-2xl shadow-sm border-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#6B7280] mb-1">Total Users</p>
              <p className="text-3xl font-bold text-[#111827]">12,847</p>
              <p className="text-xs text-[#16A34A] mt-2">+8.2% this month</p>
            </div>
            <div className="w-12 h-12 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-[#3B82F6]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-2xl shadow-sm border-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#6B7280] mb-1">Food Items</p>
              <p className="text-3xl font-bold text-[#111827]">3,542</p>
              <p className="text-xs text-[#6B7280] mt-2">In database</p>
            </div>
            <div className="w-12 h-12 bg-[#16A34A]/10 rounded-xl flex items-center justify-center">
              <Database className="w-6 h-6 text-[#16A34A]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-2xl shadow-sm border-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#6B7280] mb-1">Pending Review</p>
              <p className="text-3xl font-bold text-[#111827]">23</p>
              <p className="text-xs text-[#F97316] mt-2">Needs attention</p>
            </div>
            <div className="w-12 h-12 bg-[#F97316]/10 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-[#F97316]" />
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-2xl shadow-sm border-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-[#6B7280] mb-1">Active Plans</p>
              <p className="text-3xl font-bold text-[#111827]">8,234</p>
              <p className="text-xs text-[#16A34A] mt-2">Premium users</p>
            </div>
            <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-[#F59E0B]" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="foods" className="space-y-6">
        <TabsList className="bg-white border border-[#D1D5DB] p-1 rounded-xl">
          <TabsTrigger value="foods" className="data-[state=active]:bg-[#16A34A] data-[state=active]:text-white rounded-lg">
            Food Database
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-[#16A34A] data-[state=active]:text-white rounded-lg">
            User Management
          </TabsTrigger>
          <TabsTrigger value="flagged" className="data-[state=active]:bg-[#16A34A] data-[state=active]:text-white rounded-lg">
            Flagged Content
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#16A34A] data-[state=active]:text-white rounded-lg">
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Food Database Tab */}
        <TabsContent value="foods">
          <Card className="p-6 bg-white rounded-2xl shadow-sm border-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#111827]">Food Database</h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                  <Input placeholder="Search foods..." className="pl-10 w-64 bg-[#F3F4F6] border-0" />
                </div>
                <Button className="bg-[#16A34A] hover:bg-[#15803D]">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Food
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Calories</TableHead>
                  <TableHead>Protein (g)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {foodDatabase.map((food) => (
                  <TableRow key={food.id}>
                    <TableCell className="font-medium">{food.name}</TableCell>
                    <TableCell>{food.calories}</TableCell>
                    <TableCell>{food.protein}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          food.status === "approved"
                            ? "bg-[#16A34A] text-white"
                            : "bg-[#F97316] text-white"
                        }
                      >
                        {food.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="icon" variant="ghost" className="w-8 h-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-8 h-8 text-[#DC2626]">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users">
          <Card className="p-6 bg-white rounded-2xl shadow-sm border-0">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[#111827]">Users</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <Input placeholder="Search users..." className="pl-10 w-64 bg-[#F3F4F6] border-0" />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.plan === "Premium"
                            ? "bg-[#F97316] text-white"
                            : "bg-[#6B7280] text-white"
                        }
                      >
                        {user.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          user.status === "active"
                            ? "bg-[#16A34A] text-white"
                            : "bg-[#6B7280] text-white"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="border-[#D1D5DB]">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Flagged Content Tab */}
        <TabsContent value="flagged">
          <Card className="p-6 bg-white rounded-2xl shadow-sm border-0">
            <h2 className="text-xl font-semibold text-[#111827] mb-6">
              Flagged Content - Requires Review
            </h2>

            <div className="space-y-4">
              {flaggedContent.map((item) => (
                <Card key={item.id} className="p-4 bg-[#F97316]/5 border border-[#F97316]/20 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 bg-[#F97316]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-[#F97316]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">{item.type}</Badge>
                          <h3 className="font-semibold text-[#111827]">{item.name}</h3>
                        </div>
                        <p className="text-sm text-[#6B7280] mb-2">Reason: {item.reason}</p>
                        <p className="text-xs text-[#6B7280]">Submitted by: {item.user}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-[#16A34A] hover:bg-[#15803D]">
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" className="border-[#DC2626] text-[#DC2626]">
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card className="p-6 bg-white rounded-2xl shadow-sm border-0">
            <h2 className="text-xl font-semibold text-[#111827] mb-4">System Analytics</h2>
            <p className="text-[#6B7280]">Detailed analytics and insights coming soon...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
