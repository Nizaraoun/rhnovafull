// Backend API JobOffer interface that matches the REST API structure
export interface JobOfferBackend {
  id?: string;
  titre: string;
  description: string;
  localisation: string;
  position: string;
  experience: string;
  datePublication: string;
  derniereDatePourPostuler: string;
  salaire?: number;
  competencesRequises: string[];
  tags: string[];
  typedemploi: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT';
  archived: boolean;
}

// Frontend display interface (existing)
export interface JobOfferDisplay {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  status: 'active' | 'inactive' | 'filled';
  description: string;
  requirements?: string[];
  salary?: string;
  deadline: Date;
  postedDate: Date;
  applicants?: number;
}

// Filter parameters for the API
export interface JobOfferFilters {
  titre?: string;
  localisation?: string;
  typedemploi?: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP';
  page?: number;
  size?: number;
  sort?: string;
}

// Utility functions to convert between frontend and backend models
export class JobOfferMapper {
  static backendToDisplay(backend: JobOfferBackend): JobOfferDisplay {
    return {
      id: backend.id || '',
      title: backend.titre || '',
      department: backend.position || '', // Using position as department
      location: backend.localisation || '',
      type: backend.typedemploi ? backend.typedemploi.toLowerCase().replace('_', '-') : 'full-time',
      status: backend.archived ? 'inactive' : 'active',
      description: backend.description || '',
      requirements: backend.competencesRequises || [],
      salary: backend.salaire?.toString() || '',
      deadline: new Date(backend.derniereDatePourPostuler || new Date()),
      postedDate: new Date(backend.datePublication || new Date()),
      applicants: 0 // This would come from applications count API
    };
  }

  static displayToBackend(display: JobOfferDisplay): JobOfferBackend {
    // Map frontend type to backend enum
    let typedemploi: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' = 'FULL_TIME';
    if (display.type === 'part-time') {
      typedemploi = 'PART_TIME';
    } else if (display.type === 'contract') {
      typedemploi = 'CONTRACT';
    }

    return {
      id: display.id || undefined,
      titre: display.title || '',
      description: display.description || '',
      localisation: display.location || '',
      position: display.department || '',
      experience: "2-3 years", // Default or from form
      datePublication: display.postedDate ? display.postedDate.toISOString() : new Date().toISOString(),
      derniereDatePourPostuler: display.deadline ? display.deadline.toISOString() : new Date().toISOString(),
      salaire: display.salary ? parseFloat(display.salary) : undefined,
      competencesRequises: display.requirements || [],
      tags: display.requirements || [], // Use requirements as tags for now
      typedemploi: typedemploi,
      archived: display.status === 'inactive'
    };
  }
}
