"use client"

import { useState } from "react"
import { Users, CreditCard, Calendar, Search, Filter, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow } from "../ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateEnrollmentDto } from "@/types/course"

interface Enrollment {
  id: string
  student: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  course: {
    id: string
    title: string
  }
  enrolledAt: string
  amountPaid: number
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentId?: string
  paymentMethod?: string
  progress: number
  lastAccessed?: string
  completedAt?: string
}

interface EnrollmentManagerProps {
  courseId: string
  enrollments: Enrollment[]
  onEnrollmentCreate?: (data: CreateEnrollmentDto) => Promise<void>
  onEnrollmentUpdate?: (id: string, data: Partial<Enrollment>) => Promise<void>
  loading?: boolean
}

export function EnrollmentManager({
  courseId,
  enrollments,
  onEnrollmentCreate,
  onEnrollmentUpdate,
  loading = false
}: EnrollmentManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentFilter, setPaymentFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'refunded': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600'
    if (progress >= 50) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.student.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesPaymentStatus = paymentFilter === "all" || enrollment.paymentStatus === paymentFilter
    
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "completed" && enrollment.progress >= 100) ||
                         (statusFilter === "in-progress" && enrollment.progress > 0 && enrollment.progress < 100) ||
                         (statusFilter === "not-started" && enrollment.progress === 0)

    return matchesSearch && matchesPaymentStatus && matchesStatus
  })

  const stats = {
    total: enrollments.length,
    completed: enrollments.filter(e => e.progress >= 100).length,
    inProgress: enrollments.filter(e => e.progress > 0 && e.progress < 100).length,
    notStarted: enrollments.filter(e => e.progress === 0).length,
    totalRevenue: enrollments.filter(e => e.paymentStatus === 'completed').reduce((acc, e) => acc + e.amountPaid, 0)
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total Enrolled</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <div>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <div>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full" />
              <div>
                <div className="text-2xl font-bold">{stats.notStarted}</div>
                <div className="text-xs text-muted-foreground">Not Started</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">Total Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Enrollments</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              {onEnrollmentCreate && (
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm">Add Enrollment</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Manual Enrollment</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="Student email" />
                      <Input placeholder="Amount paid" type="number" />
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Payment status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancel
                        </Button>
                        <Button>Add Enrollment</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Progress" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Enrollments Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Last Access</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm || statusFilter !== "all" || paymentFilter !== "all" 
                        ? "No enrollments match your filters"
                        : "No enrollments yet"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEnrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={enrollment.student.avatar} />
                            <AvatarFallback>
                              {enrollment.student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{enrollment.student.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {enrollment.student.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">${enrollment.amountPaid.toFixed(2)}</div>
                          <Badge className={getPaymentStatusColor(enrollment.paymentStatus)}>
                            {enrollment.paymentStatus}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className={`font-medium ${getProgressColor(enrollment.progress)}`}>
                            {enrollment.progress}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-primary h-1 rounded-full" 
                              style={{ width: `${enrollment.progress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {enrollment.lastAccessed 
                            ? new Date(enrollment.lastAccessed).toLocaleDateString()
                            : "Never"
                          }
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            View Profile
                          </Button>
                          <Button variant="ghost" size="sm">
                            Send Message
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination could go here */}
          {filteredEnrollments.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div>
                Showing {filteredEnrollments.length} of {enrollments.length} enrollments
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
