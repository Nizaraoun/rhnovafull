package com.example.RhNova.services.HRservice;

import com.example.RhNova.dto.Entretiendto;
import com.example.RhNova.dto.CreateEntretienDto;
import com.example.RhNova.dto.CandidatSimpleDto;
import com.example.RhNova.model.entity.ResponRH.Entretien;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.entity.Candidat.Candidature;
import com.example.RhNova.model.enums.StatutEntretien;
import com.example.RhNova.model.enums.TypeEntretien;
import com.example.RhNova.model.enums.StatutCandidature;
import com.example.RhNova.model.mappers.EntretienMapper;
import com.example.RhNova.repositories.HRrepo.EntretienRepository;
import com.example.RhNova.repositories.UserRepository;
import com.example.RhNova.repositories.Candidatrepo.CandidatureRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EntretienServiceImpl implements EntretienService {

    // Seuil de réussite pour l'entretien (note sur 20) - configurable
    private double seuilReussite = 10.0;

    @Autowired
    private EntretienRepository entretienRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CandidatureRepository candidatureRepository;

    @Override
    public Entretiendto create(CreateEntretienDto dto, String responsableRHId) {
        System.out.println( "Creating entretien with DTO: " + dto);
        // Validation des données d'entrée
        if (dto.getCandidatureId() == null || dto.getCandidatureId().trim().isEmpty()) {
            throw new IllegalArgumentException("L'ID de la candidature est obligatoire");
        }
        if (dto.getDateEntretien() == null) {
            throw new IllegalArgumentException("La date d'entretien est obligatoire");
        }
        if (dto.getHeureEntretien() == null) {
            throw new IllegalArgumentException("L'heure d'entretien est obligatoire");
        }

        // Récupération de la candidature
        Candidature candidature = candidatureRepository.findById(dto.getCandidatureId())
                .orElseThrow(() -> new RuntimeException("Candidature non trouvée avec l'ID: " + dto.getCandidatureId()));

        // Récupération du responsable RH
        User responsableRH = userRepository.findByEmail(responsableRHId)
                .orElseThrow(() -> new RuntimeException("Responsable RH non trouvé avec l'ID: " + responsableRHId));

        // Création de l'entretien
        Entretien entretien = EntretienMapper.toEntity(dto);
        entretien.setCandidature(candidature);
        entretien.setResponsableRH(responsableRH);

        // Mise à jour du statut de la candidature à ENTRETIEN_PLANIFIE
        candidature.setStatut(StatutCandidature.ENTRETIEN_PLANIFIE);
        candidatureRepository.save(candidature);

        // Sauvegarde
        return EntretienMapper.toDTO(entretienRepository.save(entretien));
    }

    @Override
    public Entretiendto update(String id, CreateEntretienDto dto) {
        Entretien entretien = entretienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entretien non trouvé avec l'ID: " + id));

        // Mise à jour des champs
        EntretienMapper.updateEntityFromDto(entretien, dto);

        // Si une nouvelle candidature est spécifiée, la mettre à jour
        if (dto.getCandidatureId() != null && !dto.getCandidatureId().equals(entretien.getCandidature().getId())) {
            Candidature nouvelleCandidature = candidatureRepository.findById(dto.getCandidatureId())
                    .orElseThrow(() -> new RuntimeException("Candidature non trouvée avec l'ID: " + dto.getCandidatureId()));
            entretien.setCandidature(nouvelleCandidature);
            
            // Mettre à jour le statut de la nouvelle candidature
            nouvelleCandidature.setStatut(StatutCandidature.ENTRETIEN_PLANIFIE);
            candidatureRepository.save(nouvelleCandidature);
        }

        return EntretienMapper.toDTO(entretienRepository.save(entretien));
    }

    @Override
    public void delete(String id) {
        Entretien entretien = entretienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entretien non trouvé avec l'ID: " + id));
        
        // Récupérer la candidature associée
        Candidature candidature = entretien.getCandidature();
        
        // Supprimer l'entretien
        entretienRepository.deleteById(id);
        
        // Vérifier s'il reste d'autres entretiens pour cette candidature
        List<Entretien> entretiens = entretienRepository.findByCandidatureId(candidature.getId());
        
        // Si aucun autre entretien n'existe, remettre le statut à EN_ATTENTE
        if (entretiens.isEmpty()) {
            candidature.setStatut(StatutCandidature.EN_ATTENTE);
            candidatureRepository.save(candidature);
        }
    }

    @Override
    public List<Entretiendto> getAll() {
        return entretienRepository.findAll().stream()
                .map(EntretienMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Entretiendto getById(String id) {
        Entretien entretien = entretienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entretien non trouvé avec l'ID: " + id));
        return EntretienMapper.toDTO(entretien);
    }

    @Override
    public List<Entretiendto> getByDate(LocalDate date) {
        return entretienRepository.findByDateEntretien(date).stream()
                .map(EntretienMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<Entretiendto> getByDateRange(LocalDate startDate, LocalDate endDate) {
        return entretienRepository.findByDateEntretienBetween(startDate, endDate).stream()
                .map(EntretienMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<Entretiendto> getByStatut(StatutEntretien statut) {
        return entretienRepository.findByStatut(statut).stream()
                .map(EntretienMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<Entretiendto> getByType(TypeEntretien type) {
        return entretienRepository.findByType(type).stream()
                .map(EntretienMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<Entretiendto> getByCandidatureId(String candidatureId) {
        return entretienRepository.findByCandidatureId(candidatureId).stream()
                .map(EntretienMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<Entretiendto> getByResponsableRH(String responsableRHId) {
        return entretienRepository.findByResponsableRHId(responsableRHId).stream()
                .map(EntretienMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<CandidatSimpleDto> getAvailableCandidates() {
        // Récupérer toutes les candidatures qui ne sont pas refusées et qui n'ont pas encore d'entretien planifié
        List<Candidature> candidatures = candidatureRepository.findAll().stream()
                .filter(candidature -> candidature.getStatut() != StatutCandidature.REFUSEE)
                .collect(Collectors.toList());
        
        return candidatures.stream()
                .filter(candidature -> {
                    // Vérifier s'il y a déjà un entretien planifié pour cette candidature
                    List<Entretien> entretiens = entretienRepository.findByCandidatureId(candidature.getId());
                    return entretiens.isEmpty() || entretiens.stream()
                            .noneMatch(e -> e.getStatut() == StatutEntretien.PLANIFIE || e.getStatut() == StatutEntretien.CONFIRME);
                })
                .map(EntretienMapper::toCandidatSimpleDto)
                .collect(Collectors.toList());
    }

    @Override
    public Entretiendto updateStatut(String id, StatutEntretien newStatut) {
        Entretien entretien = entretienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entretien non trouvé avec l'ID: " + id));

        entretien.setStatut(newStatut);
        entretien.setDateModification(LocalDateTime.now());

        // Mettre à jour le statut de la candidature selon le statut de l'entretien
        Candidature candidature = entretien.getCandidature();
        if (newStatut == StatutEntretien.TERMINE) {
            // L'entretien est terminé, évaluer la candidature basée sur la note si elle existe
            if (entretien.getNote() != null) {
                // Utiliser le seuil de réussite défini
                if (entretien.getNote() >= seuilReussite) {
                    candidature.setStatut(StatutCandidature.ACCEPTEE);
                } else {
                    candidature.setStatut(StatutCandidature.REFUSEE);
                }
                candidatureRepository.save(candidature);
            }
            // Si pas de note, garder le statut ENTRETIEN_PLANIFIE jusqu'à ce qu'une note soit ajoutée
        } else if (newStatut == StatutEntretien.ANNULE) {
            // Si l'entretien est annulé, remettre la candidature en attente
            candidature.setStatut(StatutCandidature.EN_ATTENTE);
            candidatureRepository.save(candidature);
        }

        return EntretienMapper.toDTO(entretienRepository.save(entretien));
    }

    /**
     * Ajoute une note et des commentaires à un entretien.
     * Si une note est fournie, l'entretien est automatiquement marqué comme terminé
     * et le statut de la candidature est déterminé selon la note :
     * - Note >= seuil de réussite (défaut: 10/20) : candidature ACCEPTEE
     * - Note < seuil de réussite : candidature REFUSEE
     * 
     * @param id L'ID de l'entretien
     * @param note La note attribuée (0-20), peut être null
     * @param commentaires Les commentaires additionnels, peut être null
     * @return L'entretien mis à jour
     */
    @Override
    public Entretiendto addNote(String id, Double note, String commentaires) {
        if (note != null && (note < 0 || note > 20)) {
            throw new IllegalArgumentException("La note doit être comprise entre 0 et 20");
        }

        Entretien entretien = entretienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entretien non trouvé avec l'ID: " + id));

        entretien.setNote(note);
        if (commentaires != null) {
            entretien.setCommentaires(commentaires);
        }
        entretien.setDateModification(LocalDateTime.now());

        // Si une note est fournie, marquer l'entretien comme terminé et déterminer le statut de la candidature
        if (note != null) {
            entretien.setStatut(StatutEntretien.TERMINE);
            
            Candidature candidature = entretien.getCandidature();
            
            // Utiliser le seuil de réussite défini
            if (note >= seuilReussite) {
                candidature.setStatut(StatutCandidature.ACCEPTEE);
            } else {
                candidature.setStatut(StatutCandidature.REFUSEE);
            }
            
            candidatureRepository.save(candidature);
        }

        return EntretienMapper.toDTO(entretienRepository.save(entretien));
    }

    @Override
    public void updateCandidatureDecision(String entretienId, StatutCandidature decision) {
        Entretien entretien = entretienRepository.findById(entretienId)
                .orElseThrow(() -> new RuntimeException("Entretien non trouvé avec l'ID: " + entretienId));
        
        Candidature candidature = entretien.getCandidature();
        
        // Valider que la décision est valide (ACCEPTEE ou REFUSEE)
        if (decision != StatutCandidature.ACCEPTEE && decision != StatutCandidature.REFUSEE) {
            throw new IllegalArgumentException("La décision doit être ACCEPTEE ou REFUSEE");
        }
        
        // Mettre à jour le statut de la candidature
        candidature.setStatut(decision);
        candidatureRepository.save(candidature);
        
        // Optionnellement, marquer l'entretien comme terminé s'il ne l'est pas déjà
        if (entretien.getStatut() != StatutEntretien.TERMINE) {
            entretien.setStatut(StatutEntretien.TERMINE);
            entretien.setDateModification(LocalDateTime.now());
            entretienRepository.save(entretien);
        }
    }

    @Override
    public double getSeuilReussite() {
        return seuilReussite;
    }

    @Override
    public void setSeuilReussite(double seuil) {
        if (seuil < 0 || seuil > 20) {
            throw new IllegalArgumentException("Le seuil doit être compris entre 0 et 20");
        }
        this.seuilReussite = seuil;
    }
}

