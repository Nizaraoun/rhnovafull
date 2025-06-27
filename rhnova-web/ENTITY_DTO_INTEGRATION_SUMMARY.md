# Leave Management Entity & DTO Integration - Update Summary

## Overview
Updated the TypeScript interfaces and enums to perfectly match the Java backend entity (`DemandeConge`) and DTO (`DemandeCongedto`) structures, ensuring type safety and consistency across the full stack.

## Backend Entity & DTO Structure

### Java Entity: `DemandeConge`
```java
@Document(collection = "demande_conges")
public class DemandeConge {
    @Id
    private String id;
    private StatutDemandeConge statut;
    private TypeConge typeConge;
    @DBRef
    private User employe;
    @DBRef
    private User validateur;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private String raison;
    private int nombreJours;
    private LocalDate dateCreation;
    private LocalDate dateValidation;
    private String commentaireValidateur;
}
```

### Java DTO: `DemandeCongedto`
```java
public class DemandeCongedto {
    private String id;
    private String employeId;
    private String validateurId;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private TypeConge typeConge;
    private StatutDemandeConge statut;
    private String raison;
    private int nombreJours;
    private LocalDate dateCreation;
    private LocalDate dateValidation;
    private String commentaireValidateur;
    // Display fields
    private String employeNom;
    private String employePrenom;
    private String validateurNom;
    private String validateurPrenom;
}
```

## Frontend TypeScript Updates

### Updated Interfaces

#### LeaveRequest Interface
```typescript
export interface LeaveRequest {
  id: string;
  employeId: string;
  employeNom: string;
  employePrenom: string;
  validateurId?: string;
  validateurNom?: string;
  validateurPrenom?: string;
  dateDebut: string; // LocalDate as ISO string (YYYY-MM-DD)
  dateFin: string; // LocalDate as ISO string (YYYY-MM-DD)
  typeConge: TypeConge;
  statut: StatutDemandeConge;
  raison: string;
  nombreJours: number;
  dateCreation: string; // LocalDate as ISO string
  dateValidation?: string; // LocalDate as ISO string, optional
  commentaireValidateur?: string;
}
```

#### CreateLeaveRequest Interface
```typescript
export interface CreateLeaveRequest {
  employeId: string;
  dateDebut: string; // LocalDate as ISO string (YYYY-MM-DD)
  dateFin: string; // LocalDate as ISO string (YYYY-MM-DD)
  typeConge: TypeConge;
  raison: string;
}
```

### Updated Enums

#### TypeConge Enum
```typescript
export enum TypeConge {
  CONGE_PAYE = 'CONGE_PAYE',
  CONGE_MALADIE = 'CONGE_MALADIE',
  CONGE_MATERNITE = 'CONGE_MATERNITE',
  CONGE_PATERNITE = 'CONGE_PATERNITE',
  CONGE_SANS_SOLDE = 'CONGE_SANS_SOLDE',
  CONGE_FORMATION = 'CONGE_FORMATION',
  CONGE_EXCEPTIONNEL = 'CONGE_EXCEPTIONNEL'
}
```

#### StatutDemandeConge Enum
```typescript
export enum StatutDemandeConge {
  INITIALE = 'INITIALE',
  EN_ATTENTE = 'EN_ATTENTE', 
  APPROUVEE = 'APPROUVEE',
  REJETEE = 'REJETEE',
  ANNULEE = 'ANNULEE'
}
```

## Key Changes Made

### 1. Service Layer (`LeaveManagementService`)

#### Updated Type Mappings
- **Before**: Used simplified string unions like `'VACANCES' | 'MALADIE'`
- **After**: Uses proper TypeScript enums matching Java enums exactly

#### Enhanced Label Methods
```typescript
getLeaveTypeLabel(type: string): string {
  const labels: { [key: string]: string } = {
    [TypeConge.CONGE_PAYE]: 'Congé Payé',
    [TypeConge.CONGE_MALADIE]: 'Congé Maladie',
    [TypeConge.CONGE_MATERNITE]: 'Congé Maternité',
    [TypeConge.CONGE_PATERNITE]: 'Congé Paternité',
    [TypeConge.CONGE_SANS_SOLDE]: 'Congé Sans Solde',
    [TypeConge.CONGE_FORMATION]: 'Congé Formation',
    [TypeConge.CONGE_EXCEPTIONNEL]: 'Congé Exceptionnel',
    // Legacy support maintained
  };
  return labels[type] || type;
}
```

#### Status Handling
```typescript
getStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    [StatutDemandeConge.INITIALE]: 'Initiale',
    [StatutDemandeConge.EN_ATTENTE]: 'En Attente',
    [StatutDemandeConge.APPROUVEE]: 'Approuvée',
    [StatutDemandeConge.REJETEE]: 'Rejetée',
    [StatutDemandeConge.ANNULEE]: 'Annulée',
    // Legacy support for backward compatibility
  };
  return labels[status] || status;
}
```

### 2. Manager Component (`LeaveRequestsComponent`)

#### Updated Mapping Methods
```typescript
private mapLeaveType(apiType: TypeConge): string {
  const typeMap: { [key: string]: string } = {
    [TypeConge.CONGE_PAYE]: 'Congé payé',
    [TypeConge.CONGE_MALADIE]: 'Congé maladie',
    [TypeConge.CONGE_MATERNITE]: 'Congé maternité',
    [TypeConge.CONGE_PATERNITE]: 'Congé paternité',
    [TypeConge.CONGE_SANS_SOLDE]: 'Congé sans solde',
    [TypeConge.CONGE_FORMATION]: 'Congé formation',
    [TypeConge.CONGE_EXCEPTIONNEL]: 'Congé exceptionnel'
  };
  return typeMap[apiType] || apiType;
}
```

#### Status Mapping
```typescript
private mapStatus(apiStatus: StatutDemandeConge): 'Pending' | 'Approved' | 'Rejected' {
  const statusMap: { [key: string]: 'Pending' | 'Approved' | 'Rejected' } = {
    [StatutDemandeConge.INITIALE]: 'Pending',
    [StatutDemandeConge.EN_ATTENTE]: 'Pending',
    [StatutDemandeConge.APPROUVEE]: 'Approved',
    [StatutDemandeConge.REJETEE]: 'Rejected',
    [StatutDemandeConge.ANNULEE]: 'Rejected'
  };
  return statusMap[apiStatus] || 'Pending';
}
```

#### Priority Logic Update
```typescript
private determinePriority(apiRequest: ApiLeaveRequest): 'Normal' | 'Urgent' {
  // Uses enum comparison instead of string
  if (apiRequest.typeConge === TypeConge.CONGE_MALADIE) {
    return 'Urgent';
  }
  // Date-based priority logic
  const startDate = new Date(apiRequest.dateDebut);
  const today = new Date();
  const diffTime = startDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= 7 ? 'Urgent' : 'Normal';
}
```

### 3. Team Member Form (`RequestLeaveFormComponent`)

#### Updated Leave Type Options (HTML)
```html
<select id="leaveType" formControlName="leaveType" class="form-control">
  <option value="">Sélectionner un type</option>
  <option value="CONGE_PAYE">Congé payé</option>
  <option value="CONGE_MALADIE">Congé maladie</option>
  <option value="CONGE_MATERNITE">Congé maternité</option>
  <option value="CONGE_PATERNITE">Congé paternité</option>
  <option value="CONGE_SANS_SOLDE">Congé sans solde</option>
  <option value="CONGE_FORMATION">Congé formation</option>
  <option value="CONGE_EXCEPTIONNEL">Congé exceptionnel</option>
</select>
```

#### Enhanced Type Labels
```typescript
getLeaveTypeLabel(): string {
  const leaveType = this.leaveRequestForm.get('leaveType')?.value;
  const types: { [key: string]: string } = {
    [TypeConge.CONGE_PAYE]: 'Congé payé',
    [TypeConge.CONGE_MALADIE]: 'Congé maladie',
    [TypeConge.CONGE_MATERNITE]: 'Congé maternité',
    [TypeConge.CONGE_PATERNITE]: 'Congé paternité',
    [TypeConge.CONGE_SANS_SOLDE]: 'Congé sans solde',
    [TypeConge.CONGE_FORMATION]: 'Congé formation',
    [TypeConge.CONGE_EXCEPTIONNEL]: 'Congé exceptionnel'
  };
  return types[leaveType] || '';
}
```

## Data Type Alignment

### Date Handling
- **Backend**: Uses `LocalDate` (Java)
- **Frontend**: Uses ISO string format `YYYY-MM-DD`
- **Conversion**: Automatic through JSON serialization/deserialization

### ID Fields
- **Backend**: MongoDB ObjectId as `String`
- **Frontend**: `string` type
- **References**: `@DBRef` in entity becomes `employeId`/`validateurId` in DTO

### Enums
- **Backend**: Java enums with uppercase constants
- **Frontend**: TypeScript enums with identical string values
- **Serialization**: Direct string matching

## Backward Compatibility

### Legacy Support Maintained
- Old enum values still supported in mapping functions
- Gradual migration possible without breaking existing data
- Fallback mechanisms for unknown values

### Migration Strategy
```typescript
// Example of backward compatibility
const typeMap: { [key: string]: string } = {
  // New enum values
  [TypeConge.CONGE_PAYE]: 'Congé payé',
  [TypeConge.CONGE_MALADIE]: 'Congé maladie',
  // Legacy support
  'VACANCES': 'Congé payé',
  'MALADIE': 'Congé maladie'
};
```

## Benefits Achieved

### Type Safety
- ✅ Compile-time validation of enum values
- ✅ IntelliSense support for all enum options
- ✅ Prevention of typos and invalid values

### Consistency
- ✅ Exact match between frontend and backend enums
- ✅ Consistent naming conventions
- ✅ Unified data structures

### Maintainability
- ✅ Single source of truth for enum values
- ✅ Easy to add new leave types or statuses
- ✅ Clear separation of concerns

### User Experience
- ✅ Proper French labels for all leave types
- ✅ Comprehensive status handling
- ✅ Enhanced form validation

## Future Enhancements

### Additional Leave Types
Easy to add new types by updating both Java and TypeScript enums:
```typescript
// Just add to both backend and frontend enums
CONGE_SABBATIQUE = 'CONGE_SABBATIQUE'
```

### Status Workflow
Support for complex approval workflows:
```typescript
// Status transitions
INITIALE → EN_ATTENTE → APPROUVEE/REJETEE
```

### Validation Rules
Type-specific validation can be added:
```typescript
// Example: Maternity leave minimum duration
if (typeConge === TypeConge.CONGE_MATERNITE && nombreJours < 98) {
  // Validation error
}
```

This update ensures perfect alignment between the Java backend and Angular frontend, providing type safety, consistency, and a solid foundation for future enhancements.
