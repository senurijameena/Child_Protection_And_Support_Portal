package com.example.childPortal.controller;
import com.example.childPortal.dto.*;
import com.example.childPortal.service.SearchService;
import org.springframework.beans.factory.annotation.Autowired; 
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController 
  @RequestMapping("/api/search") 
  @CrossOrigin(origins = "*") public class SearchController {
    @Autowired
    private SearchService searchService;
    @PostMapping("/cases")
    public ResponseEntity<PaginationDTO<CaseDTO>> searchCases(
      @RequestBody CaseSearchFilterDTO filter, 
      @RequestParam(defaultValue = "0") int page, 
      @RequestParam(defaultValue = "20") int size, 
      @RequestParam(defaultValue = "reportDate") String sortBy, 
      @RequestParam(defaultValue = "DESC") String sortDirection) {
      Pageable pageable = PageRequest.of( 
        page, size,
        Sort.by(Sort.Direction.fromString(sortDirection), sortBy));
      PaginationDTO<CaseDTO> result = searchService.searchCases(filter, pageable);
        return ResponseEntity.ok(result);
    }

