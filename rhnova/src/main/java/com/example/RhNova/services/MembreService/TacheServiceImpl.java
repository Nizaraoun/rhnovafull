package com.example.RhNova.services.MembreService;

import com.example.RhNova.dto.Tachedto;
import com.example.RhNova.model.entity.Tache;
import com.example.RhNova.model.entity.User;
import com.example.RhNova.model.enums.Priorite;
import com.example.RhNova.model.enums.StatutTache;
import com.example.RhNova.repositories.TacheRepository;
import com.example.RhNova.repositories.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TacheServiceImpl implements TacheService {

    private final TacheRepository tacheRepository;
    private final UserRepository userRepository;

    private Tachedto toDto(Tache t) {
        Tachedto dto = new Tachedto();
        dto.setId(t.getId());
        dto.setTitre(t.getTitre());
        dto.setDescription(t.getDescription());
        dto.setPriorite(t.getPriorite());
        dto.setDateDebut(t.getDateDebut());
        dto.setDateFin(t.getDateFin());
        dto.setStatut(t.getStatut());
        dto.setMembreId(t.getMembre() != null ? t.getMembre().getId() : null);
        dto.setProgression(t.getProgression());
        dto.setEvaluation(t.getEvaluation());
        return dto;
    }

    private Tache toEntity(Tachedto dto) {
        Tache t = new Tache();
        t.setTitre(dto.getTitre());
        t.setDescription(dto.getDescription());
        t.setPriorite(dto.getPriorite());
        t.setDateDebut(dto.getDateDebut());
        t.setDateFin(dto.getDateFin());
        t.setStatut(dto.getStatut());
        if (dto.getMembreId() != null) {
            userRepository.findById(dto.getMembreId()).ifPresent(t::setMembre);
        }
        t.setProgression(dto.getProgression());
        t.setEvaluation(dto.getEvaluation());
        return t;
    }

    @Override
    public Tachedto createTache(Tachedto dto) {
        Tache t = toEntity(dto);
        return toDto(tacheRepository.save(t));
    }

    @Override
    public Tachedto updateTache(String id, Tachedto dto) {
        Tache existing = tacheRepository.findById(id).orElseThrow();
        existing.setTitre(dto.getTitre());
        existing.setDescription(dto.getDescription());
        existing.setPriorite(dto.getPriorite());
        existing.setDateDebut(dto.getDateDebut());
        existing.setDateFin(dto.getDateFin());
        existing.setStatut(dto.getStatut());
        if (dto.getMembreId() != null) {
            userRepository.findById(dto.getMembreId()).ifPresent(existing::setMembre);
        }
        existing.setProgression(dto.getProgression());
        existing.setEvaluation(dto.getEvaluation());
        return toDto(tacheRepository.save(existing));
    }

    @Override
    public void deleteTache(String id) {
        tacheRepository.deleteById(id);
    }

    @Override
    public List<Tachedto> getAllTaches() {
        return tacheRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public Tachedto getTacheById(String id) {
        return tacheRepository.findById(id).map(this::toDto).orElse(null);
    }

    @Override
    public List<Tachedto> getTachesByMembre(String membreId) {
        User membre = userRepository.findById(membreId).orElseThrow();
        return tacheRepository.findByMembre(membre).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<Tachedto> getTachesByEquipe(String equipeId) {
        return tacheRepository.findByMembre_Equipe_Id(equipeId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<Tachedto> filterTaches(StatutTache statut, String priorite) {
        Priorite p = Priorite.valueOf(priorite);
        return tacheRepository.findByStatutAndPriorite(statut, p)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public Tachedto updateStatut(String id, StatutTache statut) {
        Tache tache = tacheRepository.findById(id).orElseThrow();
        tache.setStatut(statut);
        return toDto(tacheRepository.save(tache));
    }

    @Override
    public Tachedto updateProgression(String id, Integer progression) {
        Tache t = tacheRepository.findById(id).orElseThrow();
        t.setProgression(progression);
        return toDto(tacheRepository.save(t));
    }

    @Override
    public Tachedto updateEvaluation(String id, Integer evaluation) {
        Tache t = tacheRepository.findById(id).orElseThrow();
        t.setEvaluation(evaluation);
        return toDto(tacheRepository.save(t));
    }

}
