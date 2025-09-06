"use client"

import { useState } from "react"
import { Star, Clock, Users, Globe, Award, CheckCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Course } from "@/services/types"
import { enrollmentService } from "@/services"
import { useToast } from "@/hooks/use-toast"

interface EnrollmentCardProps {
  course: Course
  isEnrolled?: boolean
  onEnrollmentChange?: () => void
}

export function EnrollmentCard({ course, isEnrolled = false, onEnrollmentChange }: EnrollmentCardProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const handleEnrollment = async () => {
    if (isEnrolled) return

    try {
      setLoading(true)
      
      if (course.type === 'free') {
        // For free courses, enroll directly
        await enrollmentService.enrollInCourse({
          course: course.id,
          amountPaid: 0,
          paymentStatus: 'completed',
          paymentId: `free_${Date.now()}`,
          paymentMethod: 'free'
        })
        
        toast({
          title: "Enrollment Successful!",
          description: "You have successfully enrolled in this free course."
        })
        
        onEnrollmentChange?.()
      } else {
        // For paid courses, redirect to payment or show payment modal
        // This would typically integrate with a payment provider like Stripe
        toast({
          title: "Payment Required",
          description: "Redirecting to payment page...",
        })
        
        // Simulate payment process
        setTimeout(async () => {
          try {
            await enrollmentService.enrollInCourse({
              course: course.id,
              amountPaid: course.price,
              paymentStatus: 'completed',
              paymentId: `payment_${Date.now()}`,
              paymentMethod: 'credit_card'
            })
            
            toast({
              title: "Payment Successful!",
              description: "You have successfully enrolled in the course."
            })
            
            onEnrollmentChange?.()
          } catch (error) {
            toast({
              title: "Payment Failed",
              description: "There was an error processing your payment. Please try again.",
              variant: "destructive"
            })
          }
        }, 2000)
      }
    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description: "There was an error enrolling in the course. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-primary">
              {course.type === 'free' ? 'Free' : `$${course.price.toFixed(2)}`}
            </div>
            {course.type === 'paid' && (
              <Badge variant="outline">Premium</Badge>
            )}
          </div>
          {course.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{course.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                ({course.enrollmentCount} students)
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Course Stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{formatDuration(course.duration)} total length</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{course.enrollmentCount} students enrolled</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span>{course.language || 'English'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Award className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{course.level} level</span>
          </div>
        </div>

        <Separator />

        {/* What you'll learn */}
        {course.whatYouWillLearn.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">What you'll learn:</h4>
            <ul className="space-y-1">
              {course.whatYouWillLearn.slice(0, 4).map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
              {course.whatYouWillLearn.length > 4 && (
                <li className="text-sm text-muted-foreground">
                  +{course.whatYouWillLearn.length - 4} more learning outcomes
                </li>
              )}
            </ul>
          </div>
        )}

        <Separator />

        {/* Requirements */}
        {course.requirements.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Requirements:</h4>
            <ul className="space-y-1">
              {course.requirements.slice(0, 3).map((requirement, index) => (
                <li key={index} className="text-sm text-muted-foreground">
                  • {requirement}
                </li>
              ))}
              {course.requirements.length > 3 && (
                <li className="text-sm text-muted-foreground">
                  +{course.requirements.length - 3} more requirements
                </li>
              )}
            </ul>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-4">
        {isEnrolled ? (
          <Button className="w-full" size="lg" asChild>
            <a href={`/learn/${course.id}`}>
              Go to Course
            </a>
          </Button>
        ) : (
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleEnrollment}
            disabled={loading}
          >
            {loading ? 'Processing...' : (course.type === 'free' ? 'Enroll for Free' : 'Buy Now')}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
