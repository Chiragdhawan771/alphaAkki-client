"use client"

import { useState } from "react"
import { 
  BookOpen, 
  BarChart3, 
  Users, 
  Settings, 
  Plus,
  DollarSign,
  MessageSquare,
  Bell
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface InstructorSidebarProps {
  className?: string
}

export function InstructorSidebar({ className }: InstructorSidebarProps) {
  const pathname = usePathname()

  const navigation = [
    {
      name: "Dashboard",
      href: "/instructor",
      icon: BarChart3,
      current: pathname === "/instructor"
    },
    {
      name: "My Courses",
      href: "/instructor/courses",
      icon: BookOpen,
      current: pathname.startsWith("/instructor/courses")
    },
    {
      name: "Students",
      href: "/instructor/students",
      icon: Users,
      current: pathname === "/instructor/students"
    },
    {
      name: "Revenue",
      href: "/instructor/revenue",
      icon: DollarSign,
      current: pathname === "/instructor/revenue"
    },
    {
      name: "Messages",
      href: "/instructor/messages",
      icon: MessageSquare,
      current: pathname === "/instructor/messages",
      badge: "3"
    },
    {
      name: "Notifications",
      href: "/instructor/notifications",
      icon: Bell,
      current: pathname === "/instructor/notifications",
      badge: "5"
    },
    {
      name: "Settings",
      href: "/instructor/settings",
      icon: Settings,
      current: pathname === "/instructor/settings"
    }
  ]

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Instructor Portal</h2>
        <p className="text-sm text-muted-foreground">Manage your courses and students</p>
      </div>

      {/* Create Course Button */}
      <div className="p-4">
        <Button asChild className="w-full">
          <Link href="/instructor/courses/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Link>
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              item.current
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </div>
            {item.badge && (
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <div className="text-xs text-muted-foreground">
          <p>Need help?</p>
          <Link href="/instructor/help" className="text-primary hover:underline">
            View documentation
          </Link>
        </div>
      </div>
    </div>
  )
}
