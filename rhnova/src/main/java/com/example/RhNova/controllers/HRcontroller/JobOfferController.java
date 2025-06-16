package com.example.RhNova.controllers.HRcontroller;



import org.springframework.data.domain.Page;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.RhNova.model.entity.ResponRH.JobOffer;
import com.example.RhNova.services.HRservice.JobOfferService;


import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import com.example.RhNova.model.enums.Jobtype;


@RestController
@RequestMapping("/api/joboffers")
@CrossOrigin(origins = "*") // Pour permettre les requêtes depuis Angular
public class JobOfferController {

    private final JobOfferService jobOfferService;

    @Autowired
    public JobOfferController(JobOfferService jobOfferService) {
        this.jobOfferService = jobOfferService;

    }
    
    @PostMapping("/create")
    public JobOffer createOffer(@RequestBody JobOffer offer) {
        System.out.println("testttstst");

        return jobOfferService.addJobOffer(offer); 
    }
    
    @GetMapping("/all")
    public Page<JobOffer> getAllOffers(
        @RequestParam(required = false) String titre,
        @RequestParam(required = false) String localisation,
        @RequestParam(required = false) Jobtype typedemploi,
        @PageableDefault(size = 10, sort = "datePublication", direction = Sort.Direction.DESC) Pageable pageable) {
        return jobOfferService.getFilteredOffers(titre, localisation, typedemploi, pageable);
    }

    
    @GetMapping("/{id}")
    public JobOffer getOfferById(@PathVariable String id) {
        return jobOfferService.getOfferById(id);
    }
    
    @PutMapping("/update/{id}")
    public JobOffer updateOffer(@PathVariable String id, @RequestBody JobOffer offer) {
        return jobOfferService.updateOffer(id, offer);
    }
    
    @DeleteMapping("/delete/{id}")
    public void deleteOffer(@PathVariable String id) {
        jobOfferService.deleteOffer(id);
    }

    @PatchMapping("/archive/{id}")
    public JobOffer archiveOffer(@PathVariable String id) {
    return jobOfferService.archiveOffer(id);
    }

}