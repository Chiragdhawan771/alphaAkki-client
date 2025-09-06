"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { CourseFilters as CourseFiltersType } from "@/services/types"

interface CourseFiltersProps {
  filters: CourseFiltersType
  onFiltersChange: (filters: CourseFiltersType) => void
  categories: string[]
}

export function CourseFilters({ filters, onFiltersChange, categories }: CourseFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<CourseFiltersType>(filters)

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value || undefined }
    onFiltersChange(newFilters)
  }

  const handleFilterChange = (key: keyof CourseFiltersType, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const clearFilters = () => {
    const clearedFilters: CourseFiltersType = {
      search: filters.search, // Keep search term
      page: 1
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
    setIsOpen(false)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.level) count++
    if (filters.type) count++
    if (filters.categories?.length) count++
    if (filters.priceRange) count++
    if (filters.rating) count++
    return count
  }

  const removeFilter = (key: keyof CourseFiltersType) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    onFiltersChange(newFilters)
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search courses..."
          value={filters.search || ""}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-4"
        />
      </div>

      {/* Quick Filters and Advanced Filter Button */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select
          value={filters.sortBy || ""}
          onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value as any })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Courses</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Level Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Level</label>
                <Select
                  value={localFilters.level || ""}
                  onValueChange={(value) => handleFilterChange('level', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select
                  value={localFilters.type || ""}
                  onValueChange={(value) => handleFilterChange('type', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={localFilters.categories?.[0] || ""}
                  onValueChange={(value) => 
                    handleFilterChange('categories', value ? [value] : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Price Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={localFilters.priceRange?.min || ""}
                    onChange={(e) => {
                      const min = parseFloat(e.target.value) || 0
                      handleFilterChange('priceRange', {
                        min,
                        max: localFilters.priceRange?.max || 1000
                      })
                    }}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={localFilters.priceRange?.max || ""}
                    onChange={(e) => {
                      const max = parseFloat(e.target.value) || 1000
                      handleFilterChange('priceRange', {
                        min: localFilters.priceRange?.min || 0,
                        max
                      })
                    }}
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                <Select
                  value={localFilters.rating?.toString() || ""}
                  onValueChange={(value) => 
                    handleFilterChange('rating', value ? parseFloat(value) : undefined)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any rating</SelectItem>
                    <SelectItem value="4.5">4.5+ stars</SelectItem>
                    <SelectItem value="4.0">4.0+ stars</SelectItem>
                    <SelectItem value="3.5">3.5+ stars</SelectItem>
                    <SelectItem value="3.0">3.0+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={applyFilters} className="flex-1">
                  Apply Filters
                </Button>
                <Button onClick={clearFilters} variant="outline">
                  Clear
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Filters */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.level && (
            <Badge variant="secondary" className="gap-1">
              Level: {filters.level}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter('level')}
              />
            </Badge>
          )}
          {filters.type && (
            <Badge variant="secondary" className="gap-1">
              Type: {filters.type}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter('type')}
              />
            </Badge>
          )}
          {filters.categories?.length && (
            <Badge variant="secondary" className="gap-1">
              Category: {filters.categories[0]}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter('categories')}
              />
            </Badge>
          )}
          {filters.priceRange && (
            <Badge variant="secondary" className="gap-1">
              Price: ${filters.priceRange.min}-${filters.priceRange.max}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter('priceRange')}
              />
            </Badge>
          )}
          {filters.rating && (
            <Badge variant="secondary" className="gap-1">
              Rating: {filters.rating}+ stars
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeFilter('rating')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
