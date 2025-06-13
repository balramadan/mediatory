import { defineStore } from 'pinia'

export const useMaintenanceStore = defineStore('maintenance', {
  state: () => ({
    maintenances: [] as Array<{
      maintenance_id: number,
      equipment_id: string,
      quantity: number,
      start_date: string,
      expected_end_date: string | null,
      actual_end_date: string | null,
      maintenance_type: string,
      description: string | null,
      technician_name: string | null,
      status: string,
      notes: string | null,
      admin_id: string | null,
      equipment: any,
      admin: any
    }>,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchMaintenances(filter?: { status?: string }) {
      this.loading = true;
      this.error = null;
      
      try {
        let url = '/api/maintenance';
        if (filter?.status) {
          url += `?status=${filter.status}`;
        }
        
        const response = await $fetch<any>(url, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.statusCode === 200) {
          this.maintenances = response.data;
        } else {
          this.error = response.message || 'Error fetching maintenance data';
        }
      } catch (error: any) {
        console.error("Error in fetchMaintenances:", error);
        this.error = error.message || 'Unknown error occurred';
      } finally {
        this.loading = false;
      }
    },
    
    async createMaintenance(maintenanceData: any) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await $fetch('/api/maintenance', {
          method: 'POST',
          body: maintenanceData,
          credentials: 'include',
        });
        
        if (response.statusCode === 200 && 'data' in response) {
          await this.fetchMaintenances();
          return { success: true, data: response.data };
        } else {
          this.error = response.message;
          return { success: false, message: this.error };
        }
      } catch (error: any) {
        console.error("Error in createMaintenance:", error);
        this.error = error.message || 'Unknown error occurred';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async updateMaintenance(id: number, updateData: any) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await $fetch(`/api/maintenance/${id}`, {
          method: 'PUT',
          body: updateData,
          credentials: 'include',
        });
        
        if (response.statusCode === 200 && 'data' in response) {
          // Update local state
          const index = this.maintenances.findIndex(m => m.maintenance_id === id);
          if (index !== -1) {
            this.maintenances[index] = { ...this.maintenances[index], ...response.data };
          }
          
          await this.fetchMaintenances();
          return { success: true, data: response.data };
        } else {
          this.error = response.message;
          return { success: false, message: this.error };
        }
      } catch (error: any) {
        console.error("Error in updateMaintenance:", error);
        this.error = error.message || 'Unknown error occurred';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    },
    
    async getMaintenance(id: number) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await $fetch(`/api/maintenance/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        
        if (response.statusCode === 200 && 'data' in response) {
          return { success: true, data: response.data };
        } else {
          this.error = response.message;
          return { success: false, message: this.error };
        }
      } catch (error: any) {
        console.error("Error in getMaintenance:", error);
        this.error = error.message || 'Unknown error occurred';
        return { success: false, message: this.error };
      } finally {
        this.loading = false;
      }
    }
  },
})