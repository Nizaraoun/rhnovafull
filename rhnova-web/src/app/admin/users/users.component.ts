import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User, Role, UserDto } from '../../shared/models';
import { HttpService } from '../../shared/services/http.service';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchForm: FormGroup;
  userForm: FormGroup;
  showUserModal = false;  editingUser: User | null = null;
  loading = false;
  error = '';
  successMessage = '';
  departments = ['HR', 'IT', 'Engineering', 'Marketing', 'Sales', 'Finance', 'Operations'];
  roles = Object.values(Role);
  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private httpService: HttpService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      role: [''],
      status: ['']
    });    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      department: [''], // Make department optional since API doesn't require it
      status: ['active']
    });
  }


  ngOnInit() {
    this.loadUsers();
    this.setupSearchSubscription();
  }  loadUsers() {
    this.loading = true;
    this.adminService.getAllUsers().subscribe({
      next: (users: UserDto[]) => {
        console.log('Users loaded successfully:', users);
        // Transform API response to match UI expectations by adding default values
        this.users = users.map(user => ({
          ...user,
          status: 'active', // Default status since API doesn't provide it
          joinDate: new Date(), // Default to current date
          lastLogin: undefined // API doesn't provide this
        }));
        this.filteredUsers = [...this.users];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading users:', error);
        console.log('Full error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });
        // Fallback to mock data for demo purposes
        this.users = [
          {
            id: '1',
            name: 'Admin User',
            email: 'admin@rhnova.com',
            role: Role.ADMIN,
            status: 'active',
            department: 'IT',
            joinDate: new Date('2023-01-01'),
            lastLogin: new Date()
          },
         
        ];
        this.filteredUsers = [...this.users];
        this.loading = false;
      }
    });
  }

 

  setupSearchSubscription() {
    this.searchForm.valueChanges.subscribe(filters => {
      this.filterUsers(filters);
    });
  }
  filterUsers(filters: any) {
    this.filteredUsers = this.users.filter(user => {
      const matchesSearch = !filters.searchTerm || 
        user.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesRole = !filters.role || user.role === filters.role;
      const userStatus = user.status || 'active'; // Default to active if status is undefined
      const matchesStatus = !filters.status || userStatus === filters.status;
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  openUserModal(user?: User) {
    this.editingUser = user || null;
    this.showUserModal = true;
    this.error = '';
      if (user) {
      this.userForm.patchValue({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status || 'active'
      });
      // Don't show password field for editing
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      this.userForm.reset();
      this.userForm.patchValue({ status: 'active' });
      // Restore password validators for new user
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }
  closeUserModal() {
    this.showUserModal = false;
    this.editingUser = null;
    this.userForm.reset();
    this.error = '';
    this.successMessage = '';
  }

  saveUser() {
    if (this.userForm.valid) {
      this.loading = true;
      this.error = '';
      const formValue = this.userForm.value;      if (this.editingUser) {
        // Update existing user
        this.adminService.updateUser(this.editingUser.id, formValue).subscribe({
          next: (updatedUser: UserDto) => {
            // Transform response to include UI fields
            const userWithMetadata = {
              ...updatedUser,
              status: formValue.status || 'active',
              joinDate: this.editingUser?.joinDate || new Date(),
              lastLogin: this.editingUser?.lastLogin
            };
            
            const index = this.users.findIndex(u => u.id === this.editingUser!.id);
            if (index !== -1) {
              this.users[index] = userWithMetadata;
            }
            this.filterUsers(this.searchForm.value);
            this.closeUserModal();
            this.loading = false;
          },
          error: (error: any) => {
            console.error('Error updating user:', error);
            this.error = error?.error?.message || 'Failed to update user';
            this.loading = false;
          }
        });
      } else {
        // Create new internal user
        const createUserRequest = {
          name: formValue.name,
          email: formValue.email,
          password: formValue.password,
          role: formValue.role
        };

        this.adminService.createInternalUser(createUserRequest).subscribe({
          next: (newUser: UserDto) => {
            // Add department and status from form
            const userWithMetadata = {
              ...newUser,
              status: formValue.status || 'active',
              joinDate: new Date(),
              lastLogin: undefined
            };
            
            this.users.push(userWithMetadata);
            this.filterUsers(this.searchForm.value);
            this.successMessage = `User "${formValue.name}" has been created successfully!`;
            this.closeUserModal();
            this.loading = false;
            
            // Clear success message after 5 seconds
            setTimeout(() => {
              this.successMessage = '';
            }, 5000);
          },
          error: (error: any) => {
            console.error('Error creating user:', error);
            this.error = error?.error?.message || 'Failed to create user';
            this.loading = false;
          }
        });
      }
    }
  }

  deleteUser(userId: string) {
    if (confirm('Are you sure you want to delete this user?')) {      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== userId);
          this.filterUsers(this.searchForm.value);
        },
        error: (error: any) => {
          console.error('Error deleting user:', error);
          this.error = error?.error?.message || 'Failed to delete user';
        }
      });
    }
  }
  getActiveUsersCount(): number {
    return this.users.filter(user => (user.status || 'active') === 'active').length;
  }

  getInactiveUsersCount(): number {
    return this.users.filter(user => user.status === 'inactive').length;
  }

  getPendingUsersCount(): number {
    return this.users.filter(user => user.status === 'pending').length;
  }
  getStatusClass(status: string | undefined): string {
    if (!status) return 'status-pending';
    switch (status) {
      case 'active': return 'status-active';
      case 'inactive': return 'status-inactive';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  }
  getRoleDisplayName(role: string): string {
    switch (role) {
      case Role.ADMIN: return 'Administrator';
      case Role.RESPONSABLERH: return 'HR Manager';
      case Role.MANAGER: return 'Team Manager';
      case Role.MEMBRE_EQUIPE: return 'Team Member';
      case Role.CANDIDAT: return 'Candidate';
      default: return role;
    }
  }  // Check if user can create other users (only ADMIN and RESPONSABLERH)
  canCreateUsers(): boolean {
    return this.httpService.hasPermission([Role.ADMIN, Role.RESPONSABLERH]);
  }
  // Filter roles based on current user's role
  getAvailableRoles(): string[] {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    if (userData.role === Role.ADMIN) {
      return [Role.RESPONSABLERH, Role.MANAGER, Role.MEMBRE_EQUIPE];
    } else if (userData.role === Role.RESPONSABLERH) {
      return [Role.MANAGER, Role.MEMBRE_EQUIPE];
    }
    return [];
  }
}
