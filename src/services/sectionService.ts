import axiosInstance from './axiosInterceptor';
import { AxiosError } from 'axios';
import {
  Section,
  CreateSectionData,
  ApiResponse
} from './types';

interface CreateSectionDto {
  title: string;
  description?: string;
  order: number;
  isActive?: boolean;
}

class SectionService {
  // Create a new section
  async createSection(courseId: string, sectionData: CreateSectionDto): Promise<ApiResponse<Section>> {
    try {
      const response = await axiosInstance.post(`/courses/${courseId}/sections`, sectionData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create section');
      }
      throw new Error('Failed to create section');
    }
  }

  // Get section by ID
  async getSection(sectionId: string): Promise<ApiResponse<Section>> {
    try {
      const response = await axiosInstance.get(`/courses/:courseId/sections/${sectionId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch section');
      }
      throw new Error('Failed to fetch section');
    }
  }

  // Update section
  async updateSection(sectionId: string, sectionData: Partial<CreateSectionDto>): Promise<ApiResponse<Section>> {
    try {
      const response = await axiosInstance.patch(`/courses/:courseId/sections/${sectionId}`, sectionData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update section');
      }
      throw new Error('Failed to update section');
    }
  }

  // Delete section
  async deleteSection(sectionId: string): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete(`/courses/:courseId/sections/${sectionId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to delete section');
      }
      throw new Error('Failed to delete section');
    }
  }

  // Reorder sections
  async reorderSections(courseId: string, sections: Array<{ id: string; order: number }>): Promise<ApiResponse<Section[]>> {
    try {
      const response = await axiosInstance.put(`/courses/${courseId}/sections/reorder`, sections);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to reorder sections');
      }
      throw new Error('Failed to reorder sections');
    }
  }

  // Get sections by course
  async getSectionsByCourse(courseId: string): Promise<ApiResponse<Section[]>> {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}/sections`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch course sections');
      }
      throw new Error('Failed to fetch course sections');
    }
  }
}

// Export singleton instance
export const sectionService = new SectionService();
export default sectionService;
