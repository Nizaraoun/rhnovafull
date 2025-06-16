package com.example.RhNova.services.HRservice;

import com.example.RhNova.dto.Entretiendto;
import java.util.List;

public interface EntretienService {
    Entretiendto create(Entretiendto dto);
    Entretiendto update(String id, Entretiendto dto);
    void delete(String id);
    List<Entretiendto> getAll();
    Entretiendto getById(String id);
}

