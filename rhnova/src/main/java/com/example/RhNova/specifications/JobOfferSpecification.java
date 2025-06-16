package com.example.RhNova.specifications;

import com.example.RhNova.model.enums.Jobtype;
import org.springframework.data.mongodb.core.query.Criteria;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * MongoDB query criteria builder for JobOffer filtering
 */
public class JobOfferSpecification {

    public static Criteria buildTitreCriteria(String titre) {
        if (titre == null || titre.trim().isEmpty()) {
            return null;
        }
        return Criteria.where("titre").regex(Pattern.compile(titre, Pattern.CASE_INSENSITIVE));
    }

    public static Criteria buildLocalisationCriteria(String localisation) {
        if (localisation == null || localisation.trim().isEmpty()) {
            return null;
        }
        return Criteria.where("localisation").regex(Pattern.compile(localisation, Pattern.CASE_INSENSITIVE));
    }

    public static Criteria buildTypeEmploiCriteria(Jobtype type) {
        if (type == null) {
            return null;
        }
        return Criteria.where("typedemploi").is(type);
    }

    public static Criteria buildNonArchivedCriteria() {
        return Criteria.where("archived").ne(true);
    }

    /**
     * Build combined criteria for job offer filtering
     */
    public static Criteria buildFilterCriteria(String titre, String localisation, Jobtype type, boolean includeArchived) {
        List<Criteria> criteriaList = new ArrayList<>();
        
        // Add individual criteria if they are not null
        Criteria titreCriteria = buildTitreCriteria(titre);
        if (titreCriteria != null) {
            criteriaList.add(titreCriteria);
        }
        
        Criteria localisationCriteria = buildLocalisationCriteria(localisation);
        if (localisationCriteria != null) {
            criteriaList.add(localisationCriteria);
        }
        
        Criteria typeCriteria = buildTypeEmploiCriteria(type);
        if (typeCriteria != null) {
            criteriaList.add(typeCriteria);
        }
        
        // Add non-archived criteria by default unless explicitly including archived
        if (!includeArchived) {
            criteriaList.add(buildNonArchivedCriteria());
        }
        
        // Return combined criteria or empty criteria if no filters
        if (criteriaList.isEmpty()) {
            return new Criteria();
        } else if (criteriaList.size() == 1) {
            return criteriaList.get(0);
        } else {
            return new Criteria().andOperator(criteriaList.toArray(new Criteria[0]));
        }
    }
}
