"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, X, Upload, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CreateCourseDto } from "@/types/course"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
const courseSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must not exceed 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000, "Description must not exceed 5000 characters"),
  shortDescription: z.string().max(200, "Short description must not exceed 200 characters").optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  language: z.string().optional(),
  duration: z.number().min(0, "Duration must be positive").optional(),
  price: z.number().min(0, "Price must be positive").optional(),
  type: z.enum(["free", "paid"]).optional(),
  thumbnail: z.string().optional(),
  previewVideo: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  requirements: z.array(z.string()).optional(),
  whatYouWillLearn: z.array(z.string()).optional(),
  targetAudience: z.array(z.string()).optional(),
  metaTitle: z.string().max(60, "Meta title must not exceed 60 characters").optional(),
  metaDescription: z.string().max(160, "Meta description must not exceed 160 characters").optional(),
  metaKeywords: z.array(z.string()).optional(),
})

interface CourseFormProps {
  initialData?: Partial<CreateCourseDto>
  onSubmit: (data: CreateCourseDto) => void
  loading?: boolean
  submitLabel?: string
}

export function CourseForm({ 
  initialData, 
  onSubmit, 
  loading = false, 
  submitLabel = "Save Course" 
}: CourseFormProps) {
  const [newCategory, setNewCategory] = useState("")
  const [newTag, setNewTag] = useState("")
  const [newRequirement, setNewRequirement] = useState("")
  const [newLearningPoint, setNewLearningPoint] = useState("")
  const [newAudience, setNewAudience] = useState("")
  const [newKeyword, setNewKeyword] = useState("")

  const form = useForm<CreateCourseDto>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      level: "beginner",
      language: "English",
      duration: 0,
      price: 0,
      type: "free",
      categories: [],
      tags: [],
      isFeatured: false,
      requirements: [],
      whatYouWillLearn: [],
      targetAudience: [],
      metaKeywords: [],
      ...initialData,
    },
  })

  const watchedType = form.watch("type")

  const addArrayItem = (field: keyof CreateCourseDto, value: string, setter: (value: string) => void) => {
    if (!value.trim()) return
    
    const currentValues = form.getValues(field) as string[] || []
    if (!currentValues.includes(value.trim())) {
      form.setValue(field, [...currentValues, value.trim()] as any)
    }
    setter("")
  }

  const removeArrayItem = (field: keyof CreateCourseDto, index: number) => {
    const currentValues = form.getValues(field) as string[] || []
    form.setValue(field, currentValues.filter((_, i) => i !== index) as any)
  }

  const ArrayInput = ({ 
    field, 
    label, 
    placeholder, 
    value, 
    onChange 
  }: {
    field: keyof CreateCourseDto
    label: string
    placeholder: string
    value: string
    onChange: (value: string) => void
  }) => {
    const items = form.watch(field) as string[] || []
    
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        <div className="flex gap-2">
          <Input
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addArrayItem(field, value, onChange)
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addArrayItem(field, value, onChange)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {items.map((item, index) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {item}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeArrayItem(field, index)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter course title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed course description"
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description for course cards"
                      className="min-h-[60px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    This will be displayed on course cards and search results
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <FormControl>
                      <Input placeholder="English" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchedType === "paid" && (
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured Course</FormLabel>
                    <FormDescription>
                      Featured courses appear prominently on the homepage
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Thumbnail URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/thumbnail.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    Course thumbnail image URL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="previewVideo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preview Video URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/preview.mp4" {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional preview video for the course
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Categories and Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Categories & Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ArrayInput
              field="categories"
              label="Categories"
              placeholder="Add category"
              value={newCategory}
              onChange={setNewCategory}
            />

            <ArrayInput
              field="tags"
              label="Tags"
              placeholder="Add tag"
              value={newTag}
              onChange={setNewTag}
            />
          </CardContent>
        </Card>

        {/* Course Content */}
        <Card>
          <CardHeader>
            <CardTitle>Course Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ArrayInput
              field="requirements"
              label="Requirements"
              placeholder="Add requirement"
              value={newRequirement}
              onChange={setNewRequirement}
            />

            <ArrayInput
              field="whatYouWillLearn"
              label="What You'll Learn"
              placeholder="Add learning outcome"
              value={newLearningPoint}
              onChange={setNewLearningPoint}
            />

            <ArrayInput
              field="targetAudience"
              label="Target Audience"
              placeholder="Add target audience"
              value={newAudience}
              onChange={setNewAudience}
            />
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input placeholder="SEO title for search engines" {...field} />
                  </FormControl>
                  <FormDescription>
                    Recommended: 50-60 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="SEO description for search engines"
                      className="min-h-[60px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Recommended: 150-160 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ArrayInput
              field="metaKeywords"
              label="Meta Keywords"
              placeholder="Add keyword"
              value={newKeyword}
              onChange={setNewKeyword}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline">
            Save as Draft
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  )
}
